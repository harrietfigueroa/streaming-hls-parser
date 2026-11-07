// Maps the zod issues of a unit schema back to the spec. This module is pure:
// it locates each issue's tag from the issue's path, classifies the issue as a
// broken rule or as a tag section 6.3.1 ignores whole, and moves ignored tags
// from their unit into the ignored lines, in position.
import type { z } from "zod";

import { UNRECOGNIZED_REQUIRED_ATTRIBUTE } from "../4-playlists/4.2-attribute-lists.js";
import {
    type IgnoreReason,
    ignoreReasons,
} from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { assertCondition } from "./assert.js";
import type { Issue } from "./rule.js";
import {
    IgnoredKind,
    type IgnoredLine,
    type RawPlaylist,
    type RawSegment,
    type RawTag,
    type RawTags,
    type RawUnit,
} from "./scan.js";
import { OccurrenceKind, type TagEntry, ValueForm } from "./tag-table.js";

/** A tag 6.3.1 ignores whole, and the 6.3.1 rule that ignores it. */
export type IgnorableTag = { readonly tag: RawTag; readonly reason: IgnoreReason };

export const SchemaIssueKind = { broken: "broken", ignorable: "ignorable" } as const;
export type SchemaIssueKind = (typeof SchemaIssueKind)[keyof typeof SchemaIssueKind];

type SchemaIssuePayloads = {
    [SchemaIssueKind.broken]: { readonly issue: Issue };
    [SchemaIssueKind.ignorable]: { readonly ignorable: IgnorableTag };
};
type SchemaIssueMember<K extends SchemaIssueKind> = { readonly kind: K } & SchemaIssuePayloads[K];
export type SchemaIssue = { [K in SchemaIssueKind]: SchemaIssueMember<K> }[SchemaIssueKind];

const IgnoreKind = { ignored: "ignored", kept: "kept" } as const;
type IgnoreKind = (typeof IgnoreKind)[keyof typeof IgnoreKind];

type IgnorePayloads = {
    [IgnoreKind.ignored]: { readonly reason: IgnoreReason };
    [IgnoreKind.kept]: Record<never, never>;
};
type IgnoreMember<K extends IgnoreKind> = { readonly kind: K } & IgnorePayloads[K];
type Ignore = { [K in IgnoreKind]: IgnoreMember<K> }[IgnoreKind];

const SEGMENTS_KEY = "segments";
const PLAYLIST_TAG_DEPTH = 1;
// A segment tag's path is ["segments", segmentIndex, tagName, ...].
const SEGMENT_TAG_DEPTH = 3;
const SEGMENT_INDEX_POSITION = 1;
const SEGMENT_TAG_NAME_POSITION = 2;
// An attribute's issue sits one step below its tag.
const ATTRIBUTE_DEPTH = 1;

/** The tag entries of each unit, by tag name. */
export type EntriesMaps = {
    readonly playlistTagEntries: ReadonlyMap<string, TagEntry>;
    readonly segmentTagEntries: ReadonlyMap<string, TagEntry>;
};

function locateTag(options: { readonly path: readonly PropertyKey[]; readonly playlist: RawPlaylist } & EntriesMaps) {
    const { path, playlist, playlistTagEntries, segmentTagEntries } = options;
    const [head] = path;
    const isStringHead = typeof head === "string";
    const isPlaylistTag = isStringHead && head !== SEGMENTS_KEY;
    if (isPlaylistTag) {
        const entry = playlistTagEntries.get(head);
        assertCondition(entry !== undefined, `Schema issue at unknown playlist key ${head}.`);
        const unit: RawUnit = playlist;
        const where = head;
        return { unit, name: head, entry, where, rest: path.slice(PLAYLIST_TAG_DEPTH) };
    }
    const pathParts = Array.from(path, String);
    assertCondition(path.length >= SEGMENT_TAG_DEPTH, `Schema issue at ${pathParts.join(".")}.`);
    const segmentIndex = path[SEGMENT_INDEX_POSITION];
    const name = path[SEGMENT_TAG_NAME_POSITION];
    assertCondition(typeof segmentIndex === "number", `Segment index ${String(segmentIndex)} is not a number.`);
    assertCondition(typeof name === "string", `Segment key ${String(name)} is not a string.`);
    const entry = segmentTagEntries.get(name);
    assertCondition(entry !== undefined, `Schema issue at unknown segment key ${name}.`);
    const unit = playlist.segments[segmentIndex];
    assertCondition(unit !== undefined, `Schema issue at missing segment ${segmentIndex}.`);
    const where = `Segment ${segmentIndex + 1} ${name}`;
    return { unit, name, entry, where, rest: path.slice(SEGMENT_TAG_DEPTH) };
}

/**
 * Finds the 6.3.1 reason an attribute-list tag is ignored for, from its issue: the custom issue an
 * unrecognized REQ- attribute raises at the tag, or a rejected value at one of its attributes, which
 * in an attribute schema is an enumerated-string's unrecognized value.
 */
function ignoreReasonOf(options: { readonly issue: z.core.$ZodIssue; readonly form: ValueForm; readonly depth: number }) {
    const { issue, form, depth } = options;
    if (form === ValueForm.attributeList) {
        if (issue.code === "custom") {
            const reason: unknown = issue.params?.["reason"];
            const isRequiredAttributeIssue = depth === 0 && reason === UNRECOGNIZED_REQUIRED_ATTRIBUTE;
            if (isRequiredAttributeIssue) {
                const ignored: Ignore = { kind: IgnoreKind.ignored, reason: ignoreReasons.unrecognizedRequiredAttribute };
                return ignored;
            }
        }
        if (issue.code === "invalid_value") {
            if (depth === ATTRIBUTE_DEPTH) {
                const ignored: Ignore = { kind: IgnoreKind.ignored, reason: ignoreReasons.unrecognizedEnumeratedValue };
                return ignored;
            }
        }
    }
    const kept: Ignore = { kind: IgnoreKind.kept };
    return kept;
}

/** Classifies one zod issue, which the library's own keys never produce, by the tag it concerns. */
export function classifySchemaIssue(options: { readonly issue: z.core.$ZodIssue; readonly playlist: RawPlaylist } & EntriesMaps) {
    const { issue, playlist, playlistTagEntries, segmentTagEntries } = options;
    const location = locateTag({ path: issue.path, playlist, playlistTagEntries, segmentTagEntries });
    const written = location.unit.tags.get(location.name);
    if (written === undefined) {
        assertCondition(location.entry.required !== undefined, `${location.where} is absent and has no required rule.`);
        const issueAbsent = { rule: location.entry.required, detail: `${location.where} is absent.` };
        const broken: SchemaIssue = { kind: SchemaIssueKind.broken, issue: issueAbsent };
        return broken;
    }
    // A repeated tag's values are an array, so its issue path names the occurrence before any attribute.
    let tag = written[0];
    let depth = location.rest.length;
    if (location.entry.occurrence.kind === OccurrenceKind.repeated) {
        const [occurrenceIndex] = location.rest;
        assertCondition(typeof occurrenceIndex === "number", `${location.where}'s issue names no occurrence.`);
        tag = written[occurrenceIndex];
        depth -= 1;
    }
    assertCondition(tag !== undefined, `${location.where}'s issue names an occurrence that was not written.`);
    const ignore = ignoreReasonOf({ issue, form: location.entry.form, depth });
    if (ignore.kind === IgnoreKind.ignored) {
        const ignorableIssue: SchemaIssue = { kind: SchemaIssueKind.ignorable, ignorable: { tag, reason: ignore.reason } };
        return ignorableIssue;
    }
    const issueFormat = { rule: location.entry.format, detail: `Line ${tag.lineNumber}: ${location.where}: ${issue.message}` };
    const broken: SchemaIssue = { kind: SchemaIssueKind.broken, issue: issueFormat };
    return broken;
}

function compareLineNumbers(left: IgnorableTag, right: IgnorableTag) {
    return left.tag.lineNumber - right.tag.lineNumber;
}

/** Merges ignored tags into a unit's ignored lines, each before the line its ignoredIndex counts up to. */
function mergeIgnored(ignored: readonly IgnoredLine[], ignorables: readonly IgnorableTag[]) {
    // The copy keeps the caller's array unsorted, since sort reorders in place.
    const pending = Array.from(ignorables).sort(compareLineNumbers);
    const merged: IgnoredLine[] = [];
    let pendingIndex = 0;
    for (let index = 0; index <= ignored.length; index += 1) {
        for (let next = pending[pendingIndex]; next !== undefined; next = pending[pendingIndex]) {
            if (next.tag.ignoredIndex !== index) {
                break;
            }
            merged.push({ kind: IgnoredKind.ignoredTag, line: next.tag.line, reason: next.reason });
            pendingIndex += 1;
        }
        const line = ignored[index];
        if (line !== undefined) {
            merged.push(line);
        }
    }
    assertCondition(pendingIndex === pending.length, `${pending.length - pendingIndex} ignored tags found no position.`);
    return merged;
}

function withoutTags(tags: RawTags, removed: ReadonlySet<RawTag>) {
    const kept = new Map<string, RawTag[]>();
    for (const [name, written] of tags) {
        const remaining: RawTag[] = [];
        for (const tag of written) {
            if (!removed.has(tag)) {
                remaining.push(tag);
            }
        }
        if (remaining.length > 0) {
            kept.set(name, remaining);
        }
    }
    return kept;
}

function groupByOwner(ignorables: readonly IgnorableTag[]) {
    const groups = new Map<number, IgnorableTag[]>();
    for (const ignorable of ignorables) {
        const index = ignorable.tag.ownerIndex;
        const group = groups.get(index);
        if (group === undefined) {
            groups.set(index, [ignorable]);
        } else {
            group.push(ignorable);
        }
    }
    return groups;
}

/** Returns `playlist` with each ignorable tag removed from its unit and kept in position among the ignored lines. */
export function withIgnoredTags(playlist: RawPlaylist, ignorables: readonly IgnorableTag[]) {
    const removed = new Set<RawTag>();
    for (const ignorable of ignorables) {
        removed.add(ignorable.tag);
    }
    const byOwner = groupByOwner(ignorables);
    function rebuildIgnored(ignored: readonly IgnoredLine[], ownerIndex: number) {
        const owned = byOwner.get(ownerIndex);
        if (owned === undefined) {
            return ignored;
        }
        return mergeIgnored(ignored, owned);
    }
    const segments: RawSegment[] = [];
    for (const [segmentIndex, segment] of playlist.segments.entries()) {
        const tags = withoutTags(segment.tags, removed);
        const ignored = rebuildIgnored(segment.ignored, segmentIndex);
        segments.push({ tags, uri: segment.uri, ignored });
    }
    const playlistIndex = playlist.segments.length;
    const tags = withoutTags(playlist.tags, removed);
    const ignored = rebuildIgnored(playlist.ignored, playlistIndex);
    const rebuilt: RawPlaylist = { tags, segments, ignored };
    return rebuilt;
}
