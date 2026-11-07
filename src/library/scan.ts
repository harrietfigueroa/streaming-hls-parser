// The static scanner of decision 16. This module is pure: it walks a
// playlist's lines once, applies section 4.1's line rules, section 4.4.1.1's
// identification, section 4.2's attribute-list grammar, and section 4.3's
// variable substitution, and groups each tag's raw value into the playlist or
// the segment it belongs to. It converts no value; the tag schemas do.
import {
    checkByteOrderMark,
    checkLine,
    classifyLine,
    type Line,
    LineCheckKind,
    LineKind,
    splitLines,
} from "../4-playlists/4.1-definition-of-a-playlist.js";
import { AttributeListKind, parseAttributeList } from "../4-playlists/4.2-attribute-lists.js";
import {
    mayContainVariableReference,
    substituteVariables,
    SubstitutionKind,
} from "../4-playlists/4.3-variable-substitution.js";
import { checkIdentification, extm3uRules } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import {
    DefinitionKind,
    EXT_X_DEFINE_TAG_NAME,
    resolveDefinition,
} from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";
import { mediaSegmentTagRules } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4-media-segment-tags.js";
import {
    EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME,
    extXDiscontinuitySequenceRules,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.3-ext-x-discontinuity-sequence.js";
import { EXT_X_DISCONTINUITY_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.3-ext-x-discontinuity.js";
import type { IgnoreReason } from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { assertCondition, unreachable } from "./assert.js";
import { Limit, type Limits } from "./options.js";
import type { Policy } from "./policy.js";
import { type Issue, Severity } from "./rule.js";
import { OccurrenceKind, type TagEntry, ValueForm } from "./tag-table.js";
import { utf8ByteLength } from "./utf8.js";

export const IgnoredKind = { comment: "comment", unrecognizedTag: "unrecognizedTag", ignoredTag: "ignoredTag" } as const;
export type IgnoredKind = (typeof IgnoredKind)[keyof typeof IgnoredKind];

type IgnoredLinePayloads = {
    [IgnoredKind.comment]: Record<never, never>;
    [IgnoredKind.unrecognizedTag]: Record<never, never>;
    [IgnoredKind.ignoredTag]: { readonly reason: IgnoreReason };
};
type IgnoredLineMember<K extends IgnoredKind> = { readonly kind: K; readonly line: string } & IgnoredLinePayloads[K];
/** A line the spec says to ignore, kept as written per decision 29. */
export type IgnoredLine = { [K in IgnoredKind]: IgnoredLineMember<K> }[IgnoredKind];

/** A tag's unconverted value: its attributes for an attribute-list tag, else the text after ':', or true without one. */
export type RawValue = string | true | Readonly<Record<string, string>>;

/**
 * One recognized tag as scanned, with the position its line would take among ignored lines. Per
 * decision 29 that is the next segment's ignored lines, or the playlist's after the last segment.
 */
export type RawTag = {
    readonly value: RawValue;
    readonly line: string;
    readonly lineNumber: number;
    /** The index of the segment whose ignored lines the line would join, or the segment count for the playlist's. */
    readonly ownerIndex: number;
    /** The count of the owner's ignored lines that precede the line. */
    readonly ignoredIndex: number;
};

/** A unit's recognized tags by name, each name's tags in line order; a tag appearing once has one. */
export type RawTags = ReadonlyMap<string, readonly RawTag[]>;

export type RawUnit = {
    readonly tags: RawTags;
    readonly ignored: readonly IgnoredLine[];
};

export type RawSegment = RawUnit & { readonly uri: string };

export type RawPlaylist = RawUnit & { readonly segments: readonly RawSegment[] };

export const ScanKind = { scanned: "scanned", malformed: "malformed", limitExceeded: "limitExceeded" } as const;
export type ScanKind = (typeof ScanKind)[keyof typeof ScanKind];

type ScanPayloads = {
    [ScanKind.scanned]: { readonly playlist: RawPlaylist; readonly violations: readonly Issue[] };
    [ScanKind.malformed]: { readonly issue: Issue };
    [ScanKind.limitExceeded]: { readonly limit: Limit; readonly value: number };
};
type ScanMember<K extends ScanKind> = { readonly kind: K } & ScanPayloads[K];
export type Scan = { [K in ScanKind]: ScanMember<K> }[ScanKind];

const ReadKind = { read: "read", malformed: "malformed", limitExceeded: "limitExceeded" } as const;
type ReadKind = (typeof ReadKind)[keyof typeof ReadKind];

type ReadPayloads<T> = {
    [ReadKind.read]: { readonly value: T };
    [ReadKind.malformed]: { readonly issue: Issue };
    [ReadKind.limitExceeded]: Record<never, never>;
};
type ReadMember<T, K extends ReadKind> = { readonly kind: K } & ReadPayloads<T>[K];
/** One element read from a line, after substitution, or the reason it could not be. */
type Read<T> = { [K in ReadKind]: ReadMember<T, K> }[ReadKind];

type TagLine = Extract<Line, { readonly kind: typeof LineKind.tag }>;

/** What substitution reads: the variables defined so far, and the bound on a line after substitution. */
type SubstitutionContext = {
    readonly variables: ReadonlyMap<string, string>;
    readonly substitutedLineBytesMax: number;
};

const QUOTE = '"';
// Section 4.3 substitutes into quoted-string and hexadecimal-sequence values, which are told apart from
// the other value types by their first characters.
const HEXADECIMAL_PREFIX_PATTERN = /^0[xX]/;

function malformedScan(issue: Issue) {
    const malformed: Scan = { kind: ScanKind.malformed, issue };
    return malformed;
}

function limitExceededScan(limit: Limit, limits: Limits) {
    const exceeded: Scan = { kind: ScanKind.limitExceeded, limit, value: limits[limit] };
    return exceeded;
}

function atLine(issue: Issue, lineNumber: number) {
    return { rule: issue.rule, detail: `Line ${lineNumber}: ${issue.detail}` };
}

/** Checks one unsplit line against section 4.1's rules, and the first line for a Byte Order Mark too. */
function checkRawLine(line: string, lineIndex: number) {
    if (lineIndex === 0) {
        const byteOrderMarkCheck = checkByteOrderMark(line);
        if (byteOrderMarkCheck.kind === LineCheckKind.malformed) {
            return byteOrderMarkCheck;
        }
    }
    return checkLine(line);
}

/** Substitutes into one element's text, which stays as written when it holds no reference. */
function substitute(text: string, context: SubstitutionContext) {
    if (!mayContainVariableReference(text)) {
        const unchanged: Read<string> = { kind: ReadKind.read, value: text };
        return unchanged;
    }
    const substitution = substituteVariables({
        text,
        variables: context.variables,
        bytesMax: context.substitutedLineBytesMax,
    });
    switch (substitution.kind) {
        case SubstitutionKind.substituted: {
            const read: Read<string> = { kind: ReadKind.read, value: substitution.value };
            return read;
        }
        case SubstitutionKind.malformed: {
            const malformed: Read<string> = { kind: ReadKind.malformed, issue: substitution.issue };
            return malformed;
        }
        case SubstitutionKind.limitExceeded: {
            const exceeded: Read<string> = { kind: ReadKind.limitExceeded };
            return exceeded;
        }
        default: {
            substitution satisfies never;
            return unreachable(substitution);
        }
    }
}

function isSubstitutable(value: string) {
    const isQuoted = value.startsWith(QUOTE);
    const isHexadecimal = HEXADECIMAL_PREFIX_PATTERN.test(value);
    return isQuoted || isHexadecimal;
}

/** Parses an attribute-list and substitutes into its values, keeping the substituted line within its bound. */
function readAttributes(options: { readonly text: string; readonly lineBytes: number } & SubstitutionContext) {
    const { text, lineBytes, substitutedLineBytesMax } = options;
    const attributeList = parseAttributeList(text);
    if (attributeList.kind === AttributeListKind.malformed) {
        const malformed: Read<RawValue> = { kind: ReadKind.malformed, issue: attributeList.issue };
        return malformed;
    }
    const attributes: Record<string, string> = {};
    let substitutedLineBytes = lineBytes;
    for (const [name, value] of Object.entries(attributeList.attributes)) {
        if (!isSubstitutable(value)) {
            attributes[name] = value;
            continue;
        }
        const substituted = substitute(value, options);
        if (substituted.kind !== ReadKind.read) {
            return substituted;
        }
        const valueBytes = utf8ByteLength(value);
        const substitutedBytes = utf8ByteLength(substituted.value);
        substitutedLineBytes += substitutedBytes - valueBytes;
        if (substitutedLineBytes > substitutedLineBytesMax) {
            const exceeded: Read<RawValue> = { kind: ReadKind.limitExceeded };
            return exceeded;
        }
        attributes[name] = substituted.value;
    }
    const read: Read<RawValue> = { kind: ReadKind.read, value: Object.freeze(attributes) };
    return read;
}

/** Reads a tag's raw value in its entry's form; an attribute-list tag written without a value has no attributes. */
function readRawValue(options: { readonly tag: TagLine; readonly form: ValueForm; readonly lineBytes: number } & SubstitutionContext) {
    const { tag, form } = options;
    if (form === ValueForm.text) {
        let value: RawValue = true;
        if (tag.value !== undefined) {
            value = tag.value;
        }
        const read: Read<RawValue> = { kind: ReadKind.read, value };
        return read;
    }
    let text = "";
    if (tag.value !== undefined) {
        text = tag.value;
    }
    return readAttributes({ ...options, text });
}

/** Resolves an EXT-X-DEFINE tag's attributes, which its attribute-list form makes an object, to its variable. */
function defineVariable(options: {
    readonly value: RawValue;
    readonly variables: ReadonlyMap<string, string>;
    readonly uri: URL | undefined;
}) {
    const { value, variables, uri } = options;
    assertCondition(typeof value === "object", `EXT-X-DEFINE's raw value ${String(value)} is not its attributes.`);
    return resolveDefinition({ attributes: value, variables, uri });
}

/**
 * Groups `text`'s tags into the playlist and its segments by the tag names in each entries map,
 * keeping comments and unrecognized tags on the next segment, or on the playlist after the last
 * one. Each issue is resolved through `policy`: the first malformed one stops the scan, and
 * violations are collected while it continues, without the tag that broke the rule, or with a URI
 * as written. A line or a unit count past `limits` stops the scan as `limitExceeded`.
 */
export function scanPlaylist(options: {
    readonly text: string;
    readonly playlistTagEntries: ReadonlyMap<string, TagEntry>;
    readonly segmentTagEntries: ReadonlyMap<string, TagEntry>;
    readonly policy: Policy;
    readonly limits: Limits;
    readonly uri: URL | undefined;
}) {
    const { text, playlistTagEntries, segmentTagEntries, policy, limits, uri } = options;
    const playlistTags = new Map<string, RawTag[]>();
    const segments: RawSegment[] = [];
    const violations: Issue[] = [];
    const variables = new Map<string, string>();
    const context: SubstitutionContext = { variables, substitutedLineBytesMax: limits.substitutedLineBytesMax };
    let segmentTags = new Map<string, RawTag[]>();
    let ignored: IgnoredLine[] = [];
    let lineCount = 0;
    let hasDiscontinuity = false;
    // The loop is bounded by the text length, since splitLines yields at most one line per character.
    for (const rawLine of splitLines(text)) {
        const lineIndex = lineCount;
        const lineNumber = lineIndex + 1;
        lineCount += 1;
        const lineBytes = utf8ByteLength(rawLine);
        if (lineBytes > limits.lineBytesMax) {
            return limitExceededScan(Limit.lineBytesMax, limits);
        }
        const lineCheck = checkRawLine(rawLine, lineIndex);
        if (lineCheck.kind === LineCheckKind.malformed) {
            const issue = atLine(lineCheck.issue, lineNumber);
            if (policy(issue.rule) === Severity.malformed) {
                return malformedScan(issue);
            }
            violations.push(issue);
        }
        const line = classifyLine(rawLine);
        if (lineIndex === 0) {
            const identification = checkIdentification(line);
            if (identification.kind === LineCheckKind.malformed) {
                const issue = atLine(identification.issue, lineNumber);
                if (policy(issue.rule) === Severity.malformed) {
                    return malformedScan(issue);
                }
                violations.push(issue);
            }
        }
        switch (line.kind) {
            case LineKind.blank: {
                break;
            }
            case LineKind.comment: {
                ignored.push({ kind: IgnoredKind.comment, line: rawLine });
                break;
            }
            case LineKind.uri: {
                // The playlist is a unit too, so it adds one to the segment count.
                const segmentCount = segments.length + 1;
                const unitCount = segmentCount + 1;
                if (unitCount > limits.unitCountMax) {
                    return limitExceededScan(Limit.unitCountMax, limits);
                }
                const substituted = substitute(line.uri, context);
                let segmentUri = line.uri;
                if (substituted.kind === ReadKind.limitExceeded) {
                    return limitExceededScan(Limit.substitutedLineBytesMax, limits);
                }
                if (substituted.kind === ReadKind.malformed) {
                    const issue = atLine(substituted.issue, lineNumber);
                    if (policy(issue.rule) === Severity.malformed) {
                        return malformedScan(issue);
                    }
                    violations.push(issue);
                } else {
                    segmentUri = substituted.value;
                }
                segments.push({ tags: segmentTags, uri: segmentUri, ignored });
                segmentTags = new Map();
                ignored = [];
                break;
            }
            case LineKind.tag: {
                let tags = playlistTags;
                let entry = playlistTagEntries.get(line.name);
                if (entry === undefined) {
                    tags = segmentTags;
                    entry = segmentTagEntries.get(line.name);
                }
                if (entry === undefined) {
                    ignored.push({ kind: IgnoredKind.unrecognizedTag, line: rawLine });
                    break;
                }
                const read = readRawValue({ tag: line, form: entry.form, lineBytes, ...context });
                if (read.kind === ReadKind.limitExceeded) {
                    return limitExceededScan(Limit.substitutedLineBytesMax, limits);
                }
                const written = tags.get(line.name);
                const occurrence = entry.occurrence;
                const isOnce = occurrence.kind === OccurrenceKind.once;
                const isDuplicate = isOnce && written !== undefined;
                const precedesSegmentsRule = entry.precedesSegments;
                const isAfterSegments = segments.length > 0;
                const isMisplaced = precedesSegmentsRule !== undefined && isAfterSegments;
                const isSequenceAfterDiscontinuity = hasDiscontinuity && line.name === EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME;
                let issue: Issue | undefined;
                if (isDuplicate) {
                    issue = { rule: occurrence.duplicate, detail: `Line ${lineNumber}: ${line.name} repeats.` };
                } else if (isMisplaced) {
                    issue = { rule: precedesSegmentsRule, detail: `Line ${lineNumber}: ${line.name} follows a segment.` };
                } else if (isSequenceAfterDiscontinuity) {
                    const detail = `Line ${lineNumber}: ${line.name} follows an EXT-X-DISCONTINUITY.`;
                    issue = { rule: extXDiscontinuitySequenceRules.precedesDiscontinuity, detail };
                } else if (read.kind === ReadKind.malformed) {
                    issue = atLine(read.issue, lineNumber);
                } else {
                    if (line.name === EXT_X_DEFINE_TAG_NAME) {
                        const definition = defineVariable({ value: read.value, variables, uri });
                        if (definition.kind === DefinitionKind.malformed) {
                            issue = atLine(definition.issue, lineNumber);
                        } else if (definition.kind === DefinitionKind.defined) {
                            variables.set(definition.name, definition.value);
                        }
                    }
                }
                if (issue === undefined) {
                    assertCondition(read.kind === ReadKind.read, `Line ${lineNumber} has no issue and no value.`);
                    const rawTag = {
                        value: read.value,
                        line: rawLine,
                        lineNumber,
                        ownerIndex: segments.length,
                        ignoredIndex: ignored.length,
                    };
                    if (written === undefined) {
                        tags.set(line.name, [rawTag]);
                    } else {
                        written.push(rawTag);
                    }
                    if (line.name === EXT_X_DISCONTINUITY_TAG_NAME) {
                        hasDiscontinuity = true;
                    }
                    break;
                }
                if (policy(issue.rule) === Severity.malformed) {
                    return malformedScan(issue);
                }
                violations.push(issue);
                break;
            }
            default: {
                line satisfies never;
                unreachable(line);
            }
        }
    }
    if (lineCount === 0) {
        const issue = { rule: extm3uRules.identification, detail: "The playlist has no lines." };
        if (policy(issue.rule) === Severity.malformed) {
            return malformedScan(issue);
        }
        violations.push(issue);
    }
    if (segmentTags.size > 0) {
        const names = Array.from(segmentTags.keys());
        const issue = { rule: mediaSegmentTagRules.uriFollowsTags, detail: `${names.join(", ")} precede no URI.` };
        if (policy(issue.rule) === Severity.malformed) {
            return malformedScan(issue);
        }
        violations.push(issue);
    }
    const playlist: RawPlaylist = { tags: playlistTags, segments, ignored };
    const scanned: Scan = { kind: ScanKind.scanned, playlist, violations };
    return scanned;
}
