// The static scanner of decision 16. This module is pure: it walks a
// playlist's lines once, applies section 4.1's line rules, section 4.4.1.1's
// identification, and section 4.2's attribute-list grammar, and groups each
// tag's raw value into the playlist or the segment it belongs to. It converts
// no value; the tag schemas do.
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
import { checkIdentification, extm3uRules } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import { mediaSegmentTagRules } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4-media-segment-tags.js";
import type { IgnoreReason } from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { unreachable } from "./assert.js";
import { Limit, type Limits } from "./options.js";
import type { Policy } from "./policy.js";
import { type Issue, Severity } from "./rule.js";
import { type TagEntry, ValueForm } from "./tag-table.js";
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

export type RawUnit = {
    readonly tags: ReadonlyMap<string, RawTag>;
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

const ValueReadKind = { read: "read", malformed: "malformed" } as const;
type ValueReadKind = (typeof ValueReadKind)[keyof typeof ValueReadKind];

type ValueReadPayloads = {
    [ValueReadKind.read]: { readonly value: RawValue };
    [ValueReadKind.malformed]: { readonly issue: Issue };
};
type ValueReadMember<K extends ValueReadKind> = { readonly kind: K } & ValueReadPayloads[K];
type ValueRead = { [K in ValueReadKind]: ValueReadMember<K> }[ValueReadKind];

type TagLine = Extract<Line, { readonly kind: typeof LineKind.tag }>;

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

/** Reads a tag's raw value in its entry's form; an attribute-list tag written without a value has no attributes. */
function readRawValue(tag: TagLine, form: ValueForm) {
    if (form === ValueForm.text) {
        let value: RawValue = true;
        if (tag.value !== undefined) {
            value = tag.value;
        }
        const read: ValueRead = { kind: ValueReadKind.read, value };
        return read;
    }
    let text = "";
    if (tag.value !== undefined) {
        text = tag.value;
    }
    const attributeList = parseAttributeList(text);
    if (attributeList.kind === AttributeListKind.malformed) {
        const malformed: ValueRead = { kind: ValueReadKind.malformed, issue: attributeList.issue };
        return malformed;
    }
    const read: ValueRead = { kind: ValueReadKind.read, value: attributeList.attributes };
    return read;
}

/**
 * Groups `text`'s tags into the playlist and its segments by the tag names in each entries map,
 * keeping comments and unrecognized tags on the next segment, or on the playlist after the last
 * one. Each issue is resolved through `policy`: the first malformed one stops the scan, and
 * violations are collected while it continues, without the tag that broke the rule. A line or a
 * unit count past `limits` stops the scan as `limitExceeded`.
 */
export function scanPlaylist(options: {
    readonly text: string;
    readonly playlistTagEntries: ReadonlyMap<string, TagEntry>;
    readonly segmentTagEntries: ReadonlyMap<string, TagEntry>;
    readonly policy: Policy;
    readonly limits: Limits;
}) {
    const { text, playlistTagEntries, segmentTagEntries, policy, limits } = options;
    const playlistTags = new Map<string, RawTag>();
    const segments: RawSegment[] = [];
    const violations: Issue[] = [];
    let segmentTags = new Map<string, RawTag>();
    let ignored: IgnoredLine[] = [];
    let lineCount = 0;
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
                segments.push({ tags: segmentTags, uri: line.uri, ignored });
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
                let issue: Issue | undefined;
                const read = readRawValue(line, entry.form);
                if (tags.has(line.name)) {
                    issue = { rule: entry.duplicate, detail: `Line ${lineNumber}: ${line.name} repeats.` };
                } else if (read.kind === ValueReadKind.malformed) {
                    issue = atLine(read.issue, lineNumber);
                } else {
                    const rawTag = {
                        value: read.value,
                        line: rawLine,
                        lineNumber,
                        ownerIndex: segments.length,
                        ignoredIndex: ignored.length,
                    };
                    tags.set(line.name, rawTag);
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
