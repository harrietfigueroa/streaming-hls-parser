// The static scanner. This module is pure: it walks a
// playlist's lines once, applies section 4.1's line rules, section 4.4.1.1's
// identification, section 4.2's attribute-list grammar, and section 4.3's
// variable substitution, settles the playlist's kind, and groups each tag's
// raw value into the playlist or the unit it belongs to. It converts no value;
// the tag schemas do.
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
import {
    EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME,
    extXDiscontinuitySequenceRules,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.3-ext-x-discontinuity-sequence.js";
import { EXT_X_DISCONTINUITY_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.3-ext-x-discontinuity.js";
import { EXT_X_PART_TAG_NAME, extXPartRules } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";
import type { IgnoreReason } from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { assertCondition, unreachable } from "./assert.js";
import { Limit, type Limits } from "./options.js";
import type { Policy } from "./policy.js";
import { type Issue, type Rule, Severity } from "./rule.js";
import { type EntriesByKind, OccurrenceKind, PlaylistKind, type TagEntry, ValueForm } from "./tag-table.js";
import { utf8ByteLength } from "./utf8.js";

export const IgnoredKind = {
    comment: "comment",
    unrecognizedTag: "unrecognizedTag",
    ignoredTag: "ignoredTag",
    ignoredUri: "ignoredUri",
} as const;
export type IgnoredKind = (typeof IgnoredKind)[keyof typeof IgnoredKind];

type IgnoredLinePayloads = {
    [IgnoredKind.comment]: Record<never, never>;
    [IgnoredKind.unrecognizedTag]: Record<never, never>;
    [IgnoredKind.ignoredTag]: { readonly reason: IgnoreReason };
    [IgnoredKind.ignoredUri]: { readonly reason: IgnoreReason };
};
type IgnoredLineMember<K extends IgnoredKind> = { readonly kind: K; readonly line: string } & IgnoredLinePayloads[K];
/** A line the spec says to ignore, kept as written in position. */
export type IgnoredLine = { [K in IgnoredKind]: IgnoredLineMember<K> }[IgnoredKind];

/** A tag's unconverted value: its attributes for an attribute-list tag, else the text after ':', or true without one. */
export type RawValue = string | true | Readonly<Record<string, string>>;

/**
 * One recognized tag as scanned, with the position its line would take among ignored lines: the
 * next unit's ignored lines, or the playlist's after the last unit.
 */
export type RawTag = {
    readonly value: RawValue;
    readonly line: string;
    readonly lineNumber: number;
    /** The index of the unit whose ignored lines the line would join, or the unit count for the playlist's. */
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

/** A Media Segment or a Variant Stream as scanned: its tags, and the URI line ending it, as written and substituted. */
export type RawUriUnit = RawUnit & { readonly uri: string; readonly uriLine: string };

/**
 * The playlist as scanned, of the kind its tags settled. Segment tags written after the last URI form
 * the pending Parent Segment when they include an EXT-X-PART, as at the end of a live Low-Latency
 * playlist, and the ignored lines after the last URI then go with it.
 */
export type RawPlaylist = RawUnit & {
    readonly kind: PlaylistKind;
    readonly units: readonly RawUriUnit[];
    readonly pendingSegment?: RawUnit;
    /** Each Variable Name the playlist's definitions provide, with its resolved Variable Value. */
    readonly variables: ReadonlyMap<string, string>;
};

export const ScanKind = { scanned: "scanned", malformed: "malformed", limitExceeded: "limitExceeded" } as const;
export type ScanKind = (typeof ScanKind)[keyof typeof ScanKind];

type ScanPayloads = {
    [ScanKind.scanned]: { readonly playlist: RawPlaylist; readonly violations: readonly Issue[] };
    [ScanKind.malformed]: { readonly issue: Issue };
    [ScanKind.limitExceeded]: { readonly limit: Limit; readonly value: number };
};
type ScanMember<K extends ScanKind> = { readonly kind: K } & ScanPayloads[K];
export type Scan = { [K in ScanKind]: ScanMember<K> }[ScanKind];

const ReadKind = { read: "read", malformed: "malformed", invalidSyntax: "invalidSyntax", limitExceeded: "limitExceeded" } as const;
type ReadKind = (typeof ReadKind)[keyof typeof ReadKind];

type ReadPayloads<T> = {
    [ReadKind.read]: { readonly value: T };
    [ReadKind.malformed]: { readonly issue: Issue };
    /** The attribute-list grammar's failure, which a tag whose section says so ignores rather than reports. */
    [ReadKind.invalidSyntax]: { readonly issue: Issue };
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
        const invalid: Read<RawValue> = { kind: ReadKind.invalidSyntax, issue: attributeList.issue };
        return invalid;
    }
    const attributes: Record<string, string> = {};
    let substitutedLineBytes = lineBytes;
    for (const [name, value] of Object.entries(attributeList.attributes)) {
        if (!isSubstitutable(value)) {
            attributes[name] = value;
            continue;
        }
        const substituted = substitute(value, options);
        if (substituted.kind === ReadKind.malformed) {
            const malformed: Read<RawValue> = { kind: ReadKind.malformed, issue: substituted.issue };
            return malformed;
        }
        if (substituted.kind !== ReadKind.read) {
            const exceeded: Read<RawValue> = { kind: ReadKind.limitExceeded };
            return exceeded;
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
    readonly imported: ReadonlyMap<string, string> | undefined;
}) {
    const { value, variables, uri, imported } = options;
    assertCondition(typeof value === "object", `EXT-X-DEFINE's raw value ${String(value)} is not its attributes.`);
    return resolveDefinition({ attributes: value, variables, uri, imported });
}

/** Whether a tag belongs to the playlist as a whole, or to the unit its next URI line ends. */
const TagLevel = { playlist: "playlist", unit: "unit" } as const;
type TagLevel = (typeof TagLevel)[keyof typeof TagLevel];

const PlacementKind = { placed: "placed", shared: "shared", outOfKind: "outOfKind", unrecognized: "unrecognized" } as const;
type PlacementKind = (typeof PlacementKind)[keyof typeof PlacementKind];

type PlacementPayloads = {
    /** A tag of `playlistKind` alone, which settles the kind when it is not yet settled. */
    [PlacementKind.placed]: { readonly entry: TagEntry; readonly level: TagLevel; readonly playlistKind: PlaylistKind };
    /** A playlist tag of both kinds, read before the kind is settled. */
    [PlacementKind.shared]: { readonly entry: TagEntry };
    [PlacementKind.outOfKind]: { readonly rule: Rule };
    [PlacementKind.unrecognized]: Record<never, never>;
};
type PlacementMember<K extends PlacementKind> = { readonly kind: K } & PlacementPayloads[K];
/** Where a tag line goes, given the kind the playlist has settled so far. */
type Placement = { [K in PlacementKind]: PlacementMember<K> }[PlacementKind];

function otherKindOf(playlistKind: PlaylistKind) {
    switch (playlistKind) {
        case PlaylistKind.media: {
            return PlaylistKind.multivariant;
        }
        case PlaylistKind.multivariant: {
            return PlaylistKind.media;
        }
        default: {
            playlistKind satisfies never;
            return unreachable(playlistKind);
        }
    }
}

/** Places a tag among one kind's entries, or reports it unrecognized there. */
function placeInKind(options: { readonly name: string; readonly playlistKind: PlaylistKind; readonly entries: EntriesByKind }) {
    const { name, playlistKind, entries } = options;
    const kindEntries = entries[playlistKind];
    const playlistEntry = kindEntries.playlist.get(name);
    if (playlistEntry !== undefined) {
        const placed: Placement = { kind: PlacementKind.placed, entry: playlistEntry, level: TagLevel.playlist, playlistKind };
        return placed;
    }
    const unitEntry = kindEntries.unit.get(name);
    if (unitEntry !== undefined) {
        const placed: Placement = { kind: PlacementKind.placed, entry: unitEntry, level: TagLevel.unit, playlistKind };
        return placed;
    }
    const unrecognized: Placement = { kind: PlacementKind.unrecognized };
    return unrecognized;
}

/** Places a tag in a playlist of the settled kind, where a tag of the other kind breaks that kind's out-of-kind rule. */
function placeInSettledKind(options: { readonly name: string; readonly playlistKind: PlaylistKind; readonly entries: EntriesByKind }) {
    const { name, playlistKind, entries } = options;
    const placed = placeInKind(options);
    if (placed.kind !== PlacementKind.unrecognized) {
        return placed;
    }
    const otherKind = otherKindOf(playlistKind);
    const foreign = placeInKind({ name, playlistKind: otherKind, entries });
    if (foreign.kind !== PlacementKind.placed) {
        return placed;
    }
    const otherRules = entries[otherKind].rules;
    let rule = otherRules.unitTagOutOfKind;
    if (foreign.level === TagLevel.playlist) {
        rule = otherRules.playlistTagOutOfKind;
    }
    const outOfKind: Placement = { kind: PlacementKind.outOfKind, rule };
    return outOfKind;
}

/** Places a tag before the kind is settled: a tag both kinds hold settles nothing, and one kind's tag settles that kind. */
function placeInUnsettledKind(name: string, entries: EntriesByKind) {
    const media = placeInKind({ name, playlistKind: PlaylistKind.media, entries });
    const multivariant = placeInKind({ name, playlistKind: PlaylistKind.multivariant, entries });
    if (media.kind !== PlacementKind.placed) {
        return multivariant;
    }
    if (multivariant.kind !== PlacementKind.placed) {
        return media;
    }
    assertCondition(media.level === TagLevel.playlist, `${name} is a unit tag of both kinds.`);
    assertCondition(multivariant.level === TagLevel.playlist, `${name} is a unit tag of both kinds.`);
    const shared: Placement = { kind: PlacementKind.shared, entry: media.entry };
    return shared;
}

/**
 * Groups `text`'s tags into the playlist and its units by the tag names in each kind's entries,
 * keeping comments and unrecognized tags on the next unit, or on the playlist after the last one.
 * The first tag only one kind holds settles the playlist's kind, and a playlist that never settles
 * is a Multivariant Playlist, per section 4.4. Each issue is resolved through `policy`: the first
 * malformed one stops the scan, and violations are collected while it continues, without the tag
 * that broke the rule, or with a URI as written. A line or a unit count past `limits` stops the
 * scan as `limitExceeded`.
 */
export function scanPlaylist(options: {
    readonly text: string;
    readonly entries: EntriesByKind;
    readonly policy: Policy;
    readonly limits: Limits;
    readonly uri: URL | undefined;
    /** The variables of the Multivariant Playlist an IMPORT reads, when one was given. */
    readonly imported: ReadonlyMap<string, string> | undefined;
}) {
    const { text, entries, policy, limits, uri, imported } = options;
    const playlistTags = new Map<string, RawTag[]>();
    const units: RawUriUnit[] = [];
    const violations: Issue[] = [];
    const variables = new Map<string, string>();
    const context: SubstitutionContext = { variables, substitutedLineBytesMax: limits.substitutedLineBytesMax };
    let unitTags = new Map<string, RawTag[]>();
    let ignored: IgnoredLine[] = [];
    let lineCount = 0;
    let hasDiscontinuity = false;
    let settledKind: PlaylistKind | undefined;
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
                // The playlist is a unit too, so it adds one to the count of units its URI lines end.
                const uriUnitCount = units.length + 1;
                const unitCount = uriUnitCount + 1;
                if (unitCount > limits.unitCountMax) {
                    return limitExceededScan(Limit.unitCountMax, limits);
                }
                const substituted = substitute(line.uri, context);
                let unitUri = line.uri;
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
                    unitUri = substituted.value;
                }
                units.push({ tags: unitTags, uri: unitUri, uriLine: rawLine, ignored });
                unitTags = new Map();
                ignored = [];
                break;
            }
            case LineKind.tag: {
                let placement: Placement;
                if (settledKind === undefined) {
                    placement = placeInUnsettledKind(line.name, entries);
                } else {
                    placement = placeInSettledKind({ name: line.name, playlistKind: settledKind, entries });
                }
                if (placement.kind === PlacementKind.unrecognized) {
                    ignored.push({ kind: IgnoredKind.unrecognizedTag, line: rawLine });
                    break;
                }
                if (placement.kind === PlacementKind.outOfKind) {
                    const issue = { rule: placement.rule, detail: `Line ${lineNumber}: ${line.name} is of the other playlist kind.` };
                    if (policy(issue.rule) === Severity.malformed) {
                        return malformedScan(issue);
                    }
                    violations.push(issue);
                    break;
                }
                const entry = placement.entry;
                let tags = playlistTags;
                if (placement.kind === PlacementKind.placed) {
                    settledKind = placement.playlistKind;
                    if (placement.level === TagLevel.unit) {
                        tags = unitTags;
                    }
                }
                const read = readRawValue({ tag: line, form: entry.form, lineBytes, ...context });
                if (read.kind === ReadKind.limitExceeded) {
                    return limitExceededScan(Limit.substitutedLineBytesMax, limits);
                }
                const formatIgnoreReason = entry.ignoreOnFormatFailure;
                const isIgnoredSyntax = read.kind === ReadKind.invalidSyntax && formatIgnoreReason !== undefined;
                if (isIgnoredSyntax) {
                    ignored.push({ kind: IgnoredKind.ignoredTag, line: rawLine, reason: formatIgnoreReason });
                    break;
                }
                const written = tags.get(line.name);
                const occurrence = entry.occurrence;
                const isOnce = occurrence.kind === OccurrenceKind.once;
                const isDuplicate = isOnce && written !== undefined;
                const precedesSegmentsRule = entry.precedesSegments;
                const isAfterUnits = units.length > 0;
                const isMisplaced = precedesSegmentsRule !== undefined && isAfterUnits;
                const isSequenceAfterDiscontinuity = hasDiscontinuity && line.name === EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME;
                const hasParts = tags.has(EXT_X_PART_TAG_NAME);
                const isAfterParts = entry.precedesParts !== undefined && hasParts;
                let issue: Issue | undefined;
                if (isDuplicate) {
                    issue = { rule: occurrence.duplicate, detail: `Line ${lineNumber}: ${line.name} repeats.` };
                } else if (isMisplaced) {
                    issue = { rule: precedesSegmentsRule, detail: `Line ${lineNumber}: ${line.name} follows a segment.` };
                } else if (isSequenceAfterDiscontinuity) {
                    const detail = `Line ${lineNumber}: ${line.name} follows an EXT-X-DISCONTINUITY.`;
                    issue = { rule: extXDiscontinuitySequenceRules.precedesDiscontinuity, detail };
                } else if (isAfterParts) {
                    const detail = `Line ${lineNumber}: ${line.name} follows its Parent Segment's first EXT-X-PART.`;
                    issue = { rule: extXPartRules.parentTagsPrecedeParts, detail };
                } else if (read.kind === ReadKind.read) {
                    if (line.name === EXT_X_DEFINE_TAG_NAME) {
                        const definition = defineVariable({ value: read.value, variables, uri, imported });
                        if (definition.kind === DefinitionKind.malformed) {
                            issue = atLine(definition.issue, lineNumber);
                        } else if (definition.kind === DefinitionKind.defined) {
                            variables.set(definition.name, definition.value);
                        }
                    }
                } else {
                    issue = atLine(read.issue, lineNumber);
                }
                if (issue === undefined) {
                    assertCondition(read.kind === ReadKind.read, `Line ${lineNumber} has no issue and no value.`);
                    const rawTag = {
                        value: read.value,
                        line: rawLine,
                        lineNumber,
                        ownerIndex: units.length,
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
    let playlistKind: PlaylistKind = PlaylistKind.multivariant;
    if (settledKind !== undefined) {
        playlistKind = settledKind;
    }
    if (unitTags.has(EXT_X_PART_TAG_NAME)) {
        const pendingSegment = { tags: unitTags, ignored };
        const withPending: RawPlaylist = { kind: playlistKind, tags: playlistTags, units, ignored: [], pendingSegment, variables };
        const scannedWithPending: Scan = { kind: ScanKind.scanned, playlist: withPending, violations };
        return scannedWithPending;
    }
    if (unitTags.size > 0) {
        const names = Array.from(unitTags.keys());
        const issue = { rule: entries[playlistKind].rules.uriFollowsTags, detail: `${names.join(", ")} precede no URI.` };
        if (policy(issue.rule) === Severity.malformed) {
            return malformedScan(issue);
        }
        violations.push(issue);
    }
    const playlist: RawPlaylist = { kind: playlistKind, tags: playlistTags, units, ignored, variables };
    const scanned: Scan = { kind: ScanKind.scanned, playlist, violations };
    return scanned;
}
