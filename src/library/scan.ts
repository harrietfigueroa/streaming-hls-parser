// The static scanner of decision 16. This module is pure: it walks a
// playlist's lines once, applies section 4.1's line rules and section
// 4.4.1.1's identification, and groups each tag's raw value into the playlist
// or the segment it belongs to. It converts no value; the tag schemas do.
import {
    checkByteOrderMark,
    checkLine,
    classifyLine,
    type Line,
    LineCheckKind,
    LineKind,
    splitLines,
} from "../4-playlists/4.1-definition-of-a-playlist.js";
import { checkIdentification, extm3uRules } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import { mediaSegmentTagRules } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4-media-segment-tags.js";
import { unreachable } from "./assert.js";
import type { Policy } from "./policy.js";
import { type Issue, Severity } from "./rule.js";
import type { TagRules } from "./tag-table.js";

export const IgnoredKind = { comment: "comment", unrecognizedTag: "unrecognizedTag" } as const;
export type IgnoredKind = (typeof IgnoredKind)[keyof typeof IgnoredKind];

/** A line the spec says to ignore, kept as written per decision 29. */
export type IgnoredLine = { readonly kind: IgnoredKind; readonly line: string };

/** A tag's unconverted value: the text after its ':', or true for a tag written without one. */
export type RawValue = string | true;

export type RawSegment = {
    readonly tags: ReadonlyMap<string, RawValue>;
    readonly uri: string;
    readonly ignored: readonly IgnoredLine[];
};

export type RawPlaylist = {
    readonly tags: ReadonlyMap<string, RawValue>;
    readonly segments: readonly RawSegment[];
    readonly ignored: readonly IgnoredLine[];
};

export const ScanKind = { scanned: "scanned", malformed: "malformed" } as const;
export type ScanKind = (typeof ScanKind)[keyof typeof ScanKind];

type ScanPayloads = {
    [ScanKind.scanned]: { readonly playlist: RawPlaylist; readonly violations: readonly Issue[] };
    [ScanKind.malformed]: { readonly issue: Issue };
};
type ScanMember<K extends ScanKind> = { readonly kind: K } & ScanPayloads[K];
export type Scan = { [K in ScanKind]: ScanMember<K> }[ScanKind];

function malformedScan(issue: Issue) {
    const malformed: Scan = { kind: ScanKind.malformed, issue };
    return malformed;
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

function toRawValue(tag: Extract<Line, { readonly kind: typeof LineKind.tag }>) {
    if (tag.value === undefined) {
        return true satisfies RawValue;
    }
    return tag.value;
}

/**
 * Groups `text`'s tags into the playlist and its segments by the tag names in each rules map, keeping
 * comments and unrecognized tags on the next segment, or on the playlist after the last one. Each
 * issue is resolved through `policy`: the first malformed one stops the scan, and violations are
 * collected while it continues.
 */
export function scanPlaylist(options: {
    readonly text: string;
    readonly playlistTagRules: ReadonlyMap<string, TagRules>;
    readonly segmentTagRules: ReadonlyMap<string, TagRules>;
    readonly policy: Policy;
}) {
    const { text, playlistTagRules, segmentTagRules, policy } = options;
    const playlistTags = new Map<string, RawValue>();
    const segments: RawSegment[] = [];
    const violations: Issue[] = [];
    let segmentTags = new Map<string, RawValue>();
    let ignored: IgnoredLine[] = [];
    let lineCount = 0;
    // The loop is bounded by the text length, since splitLines yields at most one line per character.
    for (const rawLine of splitLines(text)) {
        const lineIndex = lineCount;
        const lineNumber = lineIndex + 1;
        lineCount += 1;
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
                segments.push({ tags: segmentTags, uri: line.uri, ignored });
                segmentTags = new Map();
                ignored = [];
                break;
            }
            case LineKind.tag: {
                let tags = playlistTags;
                let rules = playlistTagRules.get(line.name);
                if (rules === undefined) {
                    tags = segmentTags;
                    rules = segmentTagRules.get(line.name);
                }
                if (rules === undefined) {
                    ignored.push({ kind: IgnoredKind.unrecognizedTag, line: rawLine });
                    break;
                }
                if (tags.has(line.name)) {
                    const issue = { rule: rules.duplicate, detail: `Line ${lineNumber}: ${line.name} repeats.` };
                    if (policy(issue.rule) === Severity.malformed) {
                        return malformedScan(issue);
                    }
                    violations.push(issue);
                    break;
                }
                const value = toRawValue(line);
                tags.set(line.name, value);
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
