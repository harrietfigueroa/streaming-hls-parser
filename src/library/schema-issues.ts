// Maps the zod issues of a unit schema back to the spec. This module is pure:
// it locates each issue's tag from the issue's path, classifies the issue as a
// broken rule or as a tag section 6.3.1 ignores whole, and moves ignored tags
// from their unit into the ignored lines, in position, dropping a unit whose
// ignored tag takes its URI line with it.
import type { z } from "zod";

import {
    type IgnoreReason,
    ignoreReasonSchema,
    ignoreReasons,
} from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { assertCondition } from "./assert.js";
import type { Issue } from "./rule.js";
import {
    IgnoredKind,
    type IgnoredLine,
    type RawPlaylist,
    type RawTag,
    type RawTags,
    type RawUnit,
    type RawUriUnit,
} from "./scan.js";
import { type EntriesByKind, OccurrenceKind, PlaylistKind, type TagEntry, ValueForm } from "./tag-table.js";

/** A tag 6.3.1 ignores whole, its entry, and the rule that ignores it. */
export type IgnorableTag = { readonly tag: RawTag; readonly entry: TagEntry; readonly reason: IgnoreReason };

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

/** The output key of each kind's units. */
export const UNITS_KEYS = { [PlaylistKind.media]: "segments", [PlaylistKind.multivariant]: "variants" } as const;
const PENDING_SEGMENT_KEY = "pendingSegment";
const UNIT_NAMES = { [PlaylistKind.media]: "Segment", [PlaylistKind.multivariant]: "Variant" } as const;
const PLAYLIST_TAG_DEPTH = 1;
// A unit tag's path is [unitsKey, unitIndex, tagName, ...].
const UNIT_TAG_DEPTH = 3;
const UNIT_INDEX_POSITION = 1;
const UNIT_TAG_NAME_POSITION = 2;
// A pending segment tag's path is ["pendingSegment", tagName, ...].
const PENDING_SEGMENT_TAG_DEPTH = 2;
// An attribute's issue sits one step below its tag.
const ATTRIBUTE_DEPTH = 1;

function locateTag(options: { readonly path: readonly PropertyKey[]; readonly playlist: RawPlaylist; readonly entries: EntriesByKind }) {
    const { path, playlist } = options;
    const kindEntries = options.entries[playlist.kind];
    const unitsKey = UNITS_KEYS[playlist.kind];
    const [head] = path;
    const isStringHead = typeof head === "string";
    if (head === PENDING_SEGMENT_KEY) {
        const [, name] = path;
        assertCondition(typeof name === "string", `Pending segment key ${String(name)} is not a string.`);
        const entry = kindEntries.unit.get(name);
        assertCondition(entry !== undefined, `Schema issue at unknown pending segment key ${name}.`);
        const unit = playlist.pendingSegment;
        assertCondition(unit !== undefined, "Schema issue at a pending segment the scan did not produce.");
        const where = `The pending segment's ${name}`;
        return { unit, name, entry, where, rest: path.slice(PENDING_SEGMENT_TAG_DEPTH) };
    }
    const isPlaylistTag = isStringHead && head !== unitsKey;
    if (isPlaylistTag) {
        const entry = kindEntries.playlist.get(head);
        assertCondition(entry !== undefined, `Schema issue at unknown playlist key ${head}.`);
        const unit: RawUnit = playlist;
        const where = head;
        return { unit, name: head, entry, where, rest: path.slice(PLAYLIST_TAG_DEPTH) };
    }
    const pathParts = Array.from(path, String);
    assertCondition(path.length >= UNIT_TAG_DEPTH, `Schema issue at ${pathParts.join(".")}.`);
    const unitIndex = path[UNIT_INDEX_POSITION];
    const name = path[UNIT_TAG_NAME_POSITION];
    assertCondition(typeof unitIndex === "number", `Unit index ${String(unitIndex)} is not a number.`);
    assertCondition(typeof name === "string", `Unit key ${String(name)} is not a string.`);
    const entry = kindEntries.unit.get(name);
    assertCondition(entry !== undefined, `Schema issue at unknown unit key ${name}.`);
    const unit = playlist.units[unitIndex];
    assertCondition(unit !== undefined, `Schema issue at missing unit ${unitIndex}.`);
    const where = `${UNIT_NAMES[playlist.kind]} ${unitIndex + 1} ${name}`;
    return { unit, name, entry, where, rest: path.slice(UNIT_TAG_DEPTH) };
}

/**
 * Finds the reason an attribute-list tag is ignored for, from its issue: the reason a custom issue
 * carries in `params.ignoreReason`, or a rejected value at one of its attributes, which in an
 * attribute schema is an enumerated-string's unrecognized value.
 */
function ignoreReasonOf(options: { readonly issue: z.core.$ZodIssue; readonly form: ValueForm; readonly depth: number }) {
    const { issue, form, depth } = options;
    if (form === ValueForm.attributeList) {
        if (issue.code === "custom") {
            const carried: unknown = issue.params?.["ignoreReason"];
            const reason = ignoreReasonSchema.safeParse(carried);
            if (reason.success) {
                const ignored: Ignore = { kind: IgnoreKind.ignored, reason: reason.data };
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
export function classifySchemaIssue(options: {
    readonly issue: z.core.$ZodIssue;
    readonly playlist: RawPlaylist;
    readonly entries: EntriesByKind;
}) {
    const { issue, playlist, entries } = options;
    const location = locateTag({ path: issue.path, playlist, entries });
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
    const entry = location.entry;
    const ignore = ignoreReasonOf({ issue, form: entry.form, depth });
    if (ignore.kind === IgnoreKind.ignored) {
        const ignorableIssue: SchemaIssue = { kind: SchemaIssueKind.ignorable, ignorable: { tag, entry, reason: ignore.reason } };
        return ignorableIssue;
    }
    const formatIgnoreReason = entry.ignoreOnFormatFailure;
    if (formatIgnoreReason !== undefined) {
        const ignorableFormat: SchemaIssue = { kind: SchemaIssueKind.ignorable, ignorable: { tag, entry, reason: formatIgnoreReason } };
        return ignorableFormat;
    }
    const issueFormat = { rule: entry.format, detail: `Line ${tag.lineNumber}: ${location.where}: ${issue.message}` };
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

/** The lines of `leading`, then those of `trailing`, as a new array. */
function joinIgnored(options: { readonly leading: readonly IgnoredLine[]; readonly trailing: readonly IgnoredLine[] }) {
    const { leading, trailing } = options;
    const joined = Array.from(leading);
    for (const line of trailing) {
        joined.push(line);
    }
    return joined;
}

/**
 * Returns `playlist` with each ignorable tag removed from its unit and kept in position among the
 * ignored lines. A unit whose ignored tag ignores its URI line too is dropped: its ignored lines,
 * the tag among them, and its URI line lead the next unit's ignored lines, or the playlist's after
 * the last unit.
 */
export function withIgnoredTags(playlist: RawPlaylist, ignorables: readonly IgnorableTag[]) {
    const removed = new Set<RawTag>();
    const uriReasons = new Map<number, IgnoreReason>();
    for (const ignorable of ignorables) {
        removed.add(ignorable.tag);
        const uriReason = ignorable.entry.ignoresUri;
        if (uriReason !== undefined) {
            uriReasons.set(ignorable.tag.ownerIndex, uriReason);
        }
    }
    const byOwner = groupByOwner(ignorables);
    function rebuildIgnored(ignored: readonly IgnoredLine[], ownerIndex: number) {
        const owned = byOwner.get(ownerIndex);
        if (owned === undefined) {
            return ignored;
        }
        return mergeIgnored(ignored, owned);
    }
    const units: RawUriUnit[] = [];
    let carried: IgnoredLine[] = [];
    // A dropped unit's lines lead the next unit's ignored lines, so its text leads the next unit's text.
    let carriedStart: number | undefined;
    for (const [unitIndex, unit] of playlist.units.entries()) {
        const tags = withoutTags(unit.tags, removed);
        const ignored = rebuildIgnored(unit.ignored, unitIndex);
        const uriReason = uriReasons.get(unitIndex);
        if (uriReason !== undefined) {
            assertCondition(tags.size === 0, `Dropped unit ${unitIndex + 1} keeps ${tags.size} tags.`);
            carried = joinIgnored({ leading: carried, trailing: ignored });
            carried.push({ kind: IgnoredKind.ignoredUri, line: unit.uriLine, reason: uriReason });
            if (carriedStart === undefined) {
                carriedStart = unit.range.start;
            }
            continue;
        }
        const withCarried = joinIgnored({ leading: carried, trailing: ignored });
        carried = [];
        let start = unit.range.start;
        if (carriedStart !== undefined) {
            start = carriedStart;
        }
        carriedStart = undefined;
        units.push({ tags, uri: unit.uri, uriLine: unit.uriLine, ignored: withCarried, range: { start, end: unit.range.end } });
    }
    // Lines after the last URI belong to the pending segment when there is one, and to the playlist otherwise.
    const trailingIndex = playlist.units.length;
    const tags = withoutTags(playlist.tags, removed);
    const pending = playlist.pendingSegment;
    if (pending === undefined) {
        const trailing = rebuildIgnored(playlist.ignored, trailingIndex);
        const ignored = joinIgnored({ leading: carried, trailing });
        const rebuilt: RawPlaylist = { kind: playlist.kind, tags, units, ignored, variables: playlist.variables, source: playlist.source };
        return rebuilt;
    }
    const pendingTags = withoutTags(pending.tags, removed);
    const pendingTrailing = rebuildIgnored(pending.ignored, trailingIndex);
    const pendingIgnored = joinIgnored({ leading: carried, trailing: pendingTrailing });
    let pendingStart = pending.range.start;
    if (carriedStart !== undefined) {
        pendingStart = carriedStart;
    }
    const pendingSegment = { tags: pendingTags, ignored: pendingIgnored, range: { start: pendingStart, end: pending.range.end } };
    const rebuiltWithPending: RawPlaylist = {
        kind: playlist.kind,
        tags,
        units,
        ignored: playlist.ignored,
        pendingSegment,
        variables: playlist.variables,
        source: playlist.source,
    };
    return rebuiltWithPending;
}
