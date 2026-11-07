// The factory. createHLS builds the unit schemas from a tag
// table once, and returns the HLS namespace whose safeParse scans text into
// raw units, converts them with one safeParse, and checks the rules that span
// units. The two entry points differ only in the table they pass.
import { z } from "zod";

import { checkSegmentDuration } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { checkServerControl } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";
import { checkByteRangeOffsets } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import { checkKey } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import { checkPartDurations } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";
import { extXPartInfRules } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";
import { checkDateRanges } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.1-ext-x-daterange.js";
import { extXPreloadHintRules } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.3-ext-x-preload-hint.js";
import { checkRenditionReport } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.4-ext-x-rendition-report.js";
import { checkMedia } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import { checkRenditionGroups } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1.1-rendition-groups.js";
import { checkRenditionReferences } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";
import { checkAlternativeRendition } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2.1-alternative-renditions.js";
import { checkSessionData } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.4-ext-x-session-data.js";
import { checkSessionKeys } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.5-ext-x-session-key.js";
import { checkContentSteering } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.6-ext-x-content-steering.js";
import { checkMultivariantDefinitions } from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";
import { assertCondition, unreachable } from "./assert.js";
import { type Limit, type ParseOptions, resolveLimits } from "./options.js";
import { defaultPolicy, type Policy } from "./policy.js";
import { CheckKind, type Issue, Severity } from "./rule.js";
import { IgnoredKind, type RawPlaylist, type RawTag, type RawTags, ScanKind, scanPlaylist } from "./scan.js";
import {
    classifySchemaIssue,
    type IgnorableTag,
    SchemaIssueKind,
    UNITS_KEYS,
    withIgnoredTags,
} from "./schema-issues.js";
import { type EntriesByKind, OccurrenceKind, PlaylistKind, type TagEntry, type TagTables } from "./tag-table.js";

export { PlaylistKind } from "./tag-table.js";

export const ParseKind = { parsed: "parsed", malformed: "malformed", limitExceeded: "limitExceeded" } as const;
export type ParseKind = (typeof ParseKind)[keyof typeof ParseKind];

const ignoreReasonSchema = z.object({ section: z.string(), requirement: z.string() }).readonly();
const ignoredLinesSchema = z
    .array(
        z
            .discriminatedUnion("kind", [
                z.object({ kind: z.literal(IgnoredKind.comment), line: z.string() }),
                z.object({ kind: z.literal(IgnoredKind.unrecognizedTag), line: z.string() }),
                z.object({ kind: z.literal(IgnoredKind.ignoredTag), line: z.string(), reason: ignoreReasonSchema }),
                z.object({ kind: z.literal(IgnoredKind.ignoredUri), line: z.string(), reason: ignoreReasonSchema }),
            ])
            .readonly(),
    )
    .readonly();

function buildSchemas(tables: TagTables) {
    const segmentObjectSchema = z.object({ ...tables.media.unit.shape, uri: z.string(), ignored: ignoredLinesSchema });
    const segmentSchema = segmentObjectSchema.readonly();
    // The pending Parent Segment has no URI yet, and none of a segment's tags is required of it.
    const pendingSegmentSchema = segmentObjectSchema.omit({ uri: true }).partial().required({ ignored: true }).readonly();
    const segmentsSchema = z.array(segmentSchema).readonly();
    const mediaPlaylistSchema = z
        .object({
            ...tables.media.playlist.shape,
            kind: z.literal(PlaylistKind.media),
            segments: segmentsSchema,
            pendingSegment: pendingSegmentSchema.optional(),
            ignored: ignoredLinesSchema,
        })
        .readonly();
    const variantSchema = z.object({ ...tables.multivariant.unit.shape, uri: z.string(), ignored: ignoredLinesSchema }).readonly();
    const multivariantPlaylistSchema = z
        .object({
            ...tables.multivariant.playlist.shape,
            kind: z.literal(PlaylistKind.multivariant),
            variants: z.array(variantSchema).readonly(),
            variables: z.map(z.string(), z.string()).readonly().optional(),
            ignored: ignoredLinesSchema,
        })
        .readonly();
    return { segmentSchema, mediaPlaylistSchema, variantSchema, multivariantPlaylistSchema };
}

/** A parsed Media Playlist. */
export type MediaPlaylist = z.output<ReturnType<typeof buildSchemas>["mediaPlaylistSchema"]>;

/** A parsed Media Segment. */
export type MediaSegment = z.output<ReturnType<typeof buildSchemas>["segmentSchema"]>;

/** A parsed Multivariant Playlist. */
export type MultivariantPlaylist = z.output<ReturnType<typeof buildSchemas>["multivariantPlaylistSchema"]>;

/** A parsed Variant Stream: its EXT-X-STREAM-INF and the URI line after it. */
export type Variant = z.output<ReturnType<typeof buildSchemas>["variantSchema"]>;

/** A parsed playlist of either kind. */
export type Playlist = MediaPlaylist | MultivariantPlaylist;

type ParsePayloads = {
    [ParseKind.parsed]: { readonly playlist: Playlist; readonly violations: readonly Issue[] };
    [ParseKind.malformed]: { readonly issues: readonly Issue[] };
    [ParseKind.limitExceeded]: { readonly limit: Limit; readonly value: number };
};
type ParseMember<K extends ParseKind> = { readonly kind: K } & ParsePayloads[K];
/** The outcome of HLS.safeParse, keyed by kind. */
export type Parse = { [K in ParseKind]: ParseMember<K> }[ParseKind];

const ConversionKind = { converted: "converted", failed: "failed" } as const;
type ConversionKind = (typeof ConversionKind)[keyof typeof ConversionKind];

type ConversionPayloads = {
    [ConversionKind.converted]: { readonly playlist: Playlist };
    [ConversionKind.failed]: { readonly broken: readonly Issue[]; readonly ignorables: readonly IgnorableTag[] };
};
type ConversionMember<K extends ConversionKind> = { readonly kind: K } & ConversionPayloads[K];
type Conversion = { [K in ConversionKind]: ConversionMember<K> }[ConversionKind];

function malformedParse(issues: readonly Issue[]) {
    const malformed: Parse = { kind: ParseKind.malformed, issues };
    return malformed;
}

/** Maps each tag name to its entry, asserting the table states a required rule exactly for the tags whose schema rejects absence. */
function toEntriesMap(unit: {
    readonly shape: Readonly<Record<string, z.ZodType>>;
    readonly entries: Readonly<Record<string, TagEntry>>;
}) {
    const entriesMap = new Map(Object.entries(unit.entries));
    for (const [name, schema] of Object.entries(unit.shape)) {
        const entry = entriesMap.get(name);
        assertCondition(entry !== undefined, `Tag ${name} has a schema and no entry.`);
        const acceptsAbsence = schema.safeParse(undefined).success;
        const hasRequiredRule = entry.required !== undefined;
        assertCondition(acceptsAbsence !== hasRequiredRule, `Tag ${name}'s required rule disagrees with its schema.`);
    }
    assertCondition(entriesMap.size === Object.keys(unit.shape).length, "The entries map names a tag the shape lacks.");
    return entriesMap;
}

function valueOf(tag: RawTag) {
    return tag.value;
}

/** Gives each tag name its raw value, or a repeated tag's raw values in line order. */
function toTagValues(tags: RawTags, entries: ReadonlyMap<string, TagEntry>) {
    const values: Record<string, unknown> = {};
    for (const [name, written] of tags) {
        const entry = entries.get(name);
        assertCondition(entry !== undefined, `Scanned tag ${name} has no entry.`);
        if (entry.occurrence.kind === OccurrenceKind.repeated) {
            values[name] = Array.from(written, valueOf);
            continue;
        }
        const [tag] = written;
        assertCondition(written.length === 1, `Tag ${name} appears ${written.length} times and may appear once.`);
        assertCondition(tag !== undefined, `Tag ${name} was scanned with no value.`);
        values[name] = tag.value;
    }
    return values;
}

function toPlaylistInput(playlist: RawPlaylist, entries: EntriesByKind) {
    const kindEntries = entries[playlist.kind];
    const units = [];
    for (const unit of playlist.units) {
        const unitValues = toTagValues(unit.tags, kindEntries.unit);
        units.push({ ...unitValues, uri: unit.uri, ignored: unit.ignored });
    }
    const values = toTagValues(playlist.tags, kindEntries.playlist);
    const unitsKey = UNITS_KEYS[playlist.kind];
    // Only a Multivariant Playlist's variables are read later, by the IMPORT definitions of its Media Playlists.
    const hasImportableVariables = playlist.kind === PlaylistKind.multivariant && playlist.variables.size > 0;
    if (hasImportableVariables) {
        return { ...values, kind: playlist.kind, [unitsKey]: units, variables: playlist.variables, ignored: playlist.ignored };
    }
    const pending = playlist.pendingSegment;
    if (pending === undefined) {
        return { ...values, kind: playlist.kind, [unitsKey]: units, ignored: playlist.ignored };
    }
    const pendingValues = toTagValues(pending.tags, kindEntries.unit);
    const pendingSegment = { ...pendingValues, ignored: pending.ignored };
    return { ...values, kind: playlist.kind, [unitsKey]: units, pendingSegment, ignored: playlist.ignored };
}

type PendingSegment = NonNullable<MediaPlaylist["pendingSegment"]>;

/** Finds the broken rules within one segment's tags, the pending segment's included, without its location. */
function findUnitIssues(options: {
    readonly unit: MediaSegment | PendingSegment;
    readonly partTarget: number | undefined;
}) {
    const { unit, partTarget } = options;
    const issues: Issue[] = [];
    const keys = unit["EXT-X-KEY"];
    if (keys !== undefined) {
        for (const key of keys) {
            const keyIssues = checkKey(key);
            for (const issue of keyIssues) {
                issues.push(issue);
            }
        }
    }
    const parts = unit["EXT-X-PART"];
    if (parts === undefined) {
        return issues;
    }
    if (partTarget === undefined) {
        issues.push({ rule: extXPartInfRules.requiredWithParts, detail: "It has EXT-X-PART, and the playlist no EXT-X-PART-INF." });
        return issues;
    }
    const partIssues = checkPartDurations({ parts, partTarget });
    for (const issue of partIssues) {
        issues.push(issue);
    }
    return issues;
}

/** Finds every broken rule that spans a converted Media Playlist's tags or units. */
function findMediaPlaylistIssues(playlist: MediaPlaylist) {
    const issues: Issue[] = [];
    const targetDuration = playlist["EXT-X-TARGETDURATION"];
    const partTarget = playlist["EXT-X-PART-INF"]?.["PART-TARGET"];
    const units: { readonly unit: MediaSegment | PendingSegment; readonly where: string }[] = [];
    for (const [segmentIndex, segment] of playlist.segments.entries()) {
        const duration = segment.EXTINF.duration;
        const check = checkSegmentDuration({ targetDuration, duration, segmentIndex });
        if (check.kind === CheckKind.failed) {
            issues.push(check.issue);
        }
        units.push({ unit: segment, where: `Segment ${segmentIndex + 1}` });
    }
    if (playlist.pendingSegment !== undefined) {
        units.push({ unit: playlist.pendingSegment, where: "The pending segment" });
    }
    // A missing EXT-X-PART-INF is one broken rule however many segments have parts, so it is reported once.
    let hasReportedPartInf = false;
    for (const { unit, where } of units) {
        const unitIssues = findUnitIssues({ unit, partTarget });
        for (const issue of unitIssues) {
            const isPartInfIssue = issue.rule === extXPartInfRules.requiredWithParts;
            const isRepeat = isPartInfIssue && hasReportedPartInf;
            if (isRepeat) {
                continue;
            }
            if (isPartInfIssue) {
                hasReportedPartInf = true;
            }
            issues.push({ rule: issue.rule, detail: `${where}: ${issue.detail}` });
        }
    }
    const serverControl = playlist["EXT-X-SERVER-CONTROL"];
    const serverControlIssues = checkServerControl({ serverControl, targetDuration, partTarget });
    for (const issue of serverControlIssues) {
        issues.push(issue);
    }
    const byteRangeIssues = checkByteRangeOffsets(playlist.segments);
    for (const issue of byteRangeIssues) {
        issues.push(issue);
    }
    const dateRanges = playlist["EXT-X-DATERANGE"];
    if (dateRanges !== undefined) {
        const hasProgramDateTime = hasAnyProgramDateTime(playlist);
        const dateRangeIssues = checkDateRanges({ dateRanges, hasProgramDateTime });
        for (const issue of dateRangeIssues) {
            issues.push(issue);
        }
    }
    const isEndedWithHints = playlist["EXT-X-ENDLIST"] === true && playlist["EXT-X-PRELOAD-HINT"] !== undefined;
    if (isEndedWithHints) {
        issues.push({ rule: extXPreloadHintRules.notWithEndList, detail: "The playlist has EXT-X-ENDLIST and EXT-X-PRELOAD-HINT." });
    }
    const renditionReports = playlist["EXT-X-RENDITION-REPORT"];
    if (renditionReports !== undefined) {
        for (const report of renditionReports) {
            const reportIssues = checkRenditionReport(report);
            for (const issue of reportIssues) {
                issues.push(issue);
            }
        }
    }
    return issues;
}

function hasAnyProgramDateTime(playlist: MediaPlaylist) {
    for (const segment of playlist.segments) {
        if (segment["EXT-X-PROGRAM-DATE-TIME"] !== undefined) {
            return true;
        }
    }
    return playlist.pendingSegment?.["EXT-X-PROGRAM-DATE-TIME"] !== undefined;
}

function streamInfOf(variant: Variant) {
    return variant["EXT-X-STREAM-INF"];
}

/** Finds every broken rule that spans a converted Multivariant Playlist's tags or variants. */
function findMultivariantPlaylistIssues(playlist: MultivariantPlaylist) {
    const issues: Issue[] = [];
    const defines = playlist["EXT-X-DEFINE"];
    if (defines !== undefined) {
        const defineIssues = checkMultivariantDefinitions(defines);
        for (const issue of defineIssues) {
            issues.push(issue);
        }
    }
    let renditions: NonNullable<MultivariantPlaylist["EXT-X-MEDIA"]> = [];
    if (playlist["EXT-X-MEDIA"] !== undefined) {
        renditions = playlist["EXT-X-MEDIA"];
    }
    let iFrameStreamInfs: NonNullable<MultivariantPlaylist["EXT-X-I-FRAME-STREAM-INF"]> = [];
    if (playlist["EXT-X-I-FRAME-STREAM-INF"] !== undefined) {
        iFrameStreamInfs = playlist["EXT-X-I-FRAME-STREAM-INF"];
    }
    for (const [renditionIndex, media] of renditions.entries()) {
        const mediaIssues = checkMedia(media);
        const alternativeIssues = checkAlternativeRendition(media);
        const where = `Rendition ${renditionIndex + 1}`;
        for (const issue of mediaIssues) {
            issues.push({ rule: issue.rule, detail: `${where}: ${issue.detail}` });
        }
        for (const issue of alternativeIssues) {
            issues.push({ rule: issue.rule, detail: `${where}: ${issue.detail}` });
        }
    }
    const groupIssues = checkRenditionGroups(renditions);
    for (const issue of groupIssues) {
        issues.push(issue);
    }
    const streamInfs = Array.from(playlist.variants, streamInfOf);
    const referenceIssues = checkRenditionReferences({ streamInfs, iFrameStreamInfs, media: renditions });
    for (const issue of referenceIssues) {
        issues.push(issue);
    }
    const sessionData = playlist["EXT-X-SESSION-DATA"];
    if (sessionData !== undefined) {
        const sessionDataIssues = checkSessionData(sessionData);
        for (const issue of sessionDataIssues) {
            issues.push(issue);
        }
    }
    const sessionKeys = playlist["EXT-X-SESSION-KEY"];
    if (sessionKeys !== undefined) {
        const sessionKeyIssues = checkSessionKeys(sessionKeys);
        for (const issue of sessionKeyIssues) {
            issues.push(issue);
        }
    }
    const contentSteering = playlist["EXT-X-CONTENT-STEERING"];
    if (contentSteering !== undefined) {
        const steeringIssues = checkContentSteering({ contentSteering, streamInfs });
        for (const issue of steeringIssues) {
            issues.push(issue);
        }
    }
    return issues;
}

/** Finds every broken rule that spans a converted playlist's tags or units, by its kind. */
function findPlaylistIssues(playlist: Playlist) {
    switch (playlist.kind) {
        case PlaylistKind.media: {
            return findMediaPlaylistIssues(playlist);
        }
        case PlaylistKind.multivariant: {
            return findMultivariantPlaylistIssues(playlist);
        }
        default: {
            playlist satisfies never;
            return unreachable(playlist);
        }
    }
}

/** Checks the rules spanning a converted playlist, resolving each issue through `policy`. */
function checkPlaylist(options: {
    readonly playlist: Playlist;
    readonly violations: readonly Issue[];
    readonly policy: Policy;
}) {
    const { playlist, policy } = options;
    const malformedIssues: Issue[] = [];
    const violations = Array.from(options.violations);
    const issues = findPlaylistIssues(playlist);
    for (const issue of issues) {
        if (policy(issue.rule) === Severity.malformed) {
            malformedIssues.push(issue);
        } else {
            violations.push(issue);
        }
    }
    if (malformedIssues.length > 0) {
        return malformedParse(malformedIssues);
    }
    const parsed: Parse = { kind: ParseKind.parsed, playlist, violations };
    return parsed;
}

// A Multivariant Playlist with no EXT-X-DEFINE declares no variable, so every IMPORT against it fails.
const NO_VARIABLES: ReadonlyMap<string, string> = new Map();

/** Creates the HLS namespace over `tables`, whose schemas are either as declared or compiled. */
export function createHLS(tables: TagTables) {
    const schemas = buildSchemas(tables);
    const entries: EntriesByKind = {
        [PlaylistKind.media]: {
            playlist: toEntriesMap(tables.media.playlist),
            unit: toEntriesMap(tables.media.unit),
            rules: tables.media.rules,
        },
        [PlaylistKind.multivariant]: {
            playlist: toEntriesMap(tables.multivariant.playlist),
            unit: toEntriesMap(tables.multivariant.unit),
            rules: tables.multivariant.rules,
        },
    };
    const policy: Policy = defaultPolicy;

    function parseInput(playlist: RawPlaylist) {
        const input = toPlaylistInput(playlist, entries);
        switch (playlist.kind) {
            case PlaylistKind.media: {
                return schemas.mediaPlaylistSchema.safeParse(input);
            }
            case PlaylistKind.multivariant: {
                return schemas.multivariantPlaylistSchema.safeParse(input);
            }
            default: {
                playlist.kind satisfies never;
                return unreachable(playlist.kind);
            }
        }
    }

    // A value failing its schema has no typed form to place in the playlist, so a broken rule here is
    // malformed under every policy.
    function convert(playlist: RawPlaylist) {
        const result = parseInput(playlist);
        if (result.success) {
            const converted: Conversion = { kind: ConversionKind.converted, playlist: result.data };
            return converted;
        }
        const broken: Issue[] = [];
        const ignorables: IgnorableTag[] = [];
        const ignoredTags = new Set<RawTag>();
        for (const issue of result.error.issues) {
            const schemaIssue = classifySchemaIssue({ issue, playlist, entries });
            if (schemaIssue.kind === SchemaIssueKind.broken) {
                broken.push(schemaIssue.issue);
            } else if (!ignoredTags.has(schemaIssue.ignorable.tag)) {
                ignoredTags.add(schemaIssue.ignorable.tag);
                ignorables.push(schemaIssue.ignorable);
            }
        }
        const failed: Conversion = { kind: ConversionKind.failed, broken, ignorables };
        return failed;
    }

    function safeParse(text: string, options: ParseOptions = {}) {
        const limits = resolveLimits(options);
        let imported: ReadonlyMap<string, string> | undefined;
        if (options.multivariant !== undefined) {
            imported = NO_VARIABLES;
            if (options.multivariant.variables !== undefined) {
                imported = options.multivariant.variables;
            }
        }
        const scan = scanPlaylist({ text, entries, policy, limits, uri: options.uri, imported });
        if (scan.kind === ScanKind.malformed) {
            return malformedParse([scan.issue]);
        }
        if (scan.kind === ScanKind.limitExceeded) {
            const exceeded: Parse = { kind: ParseKind.limitExceeded, limit: scan.limit, value: scan.value };
            return exceeded;
        }
        const first = convert(scan.playlist);
        if (first.kind === ConversionKind.converted) {
            return checkPlaylist({ playlist: first.playlist, violations: scan.violations, policy });
        }
        if (first.broken.length > 0) {
            return malformedParse(first.broken);
        }
        // Every issue names a tag 6.3.1 ignores, so the playlist converts again without those tags.
        const withoutIgnored = withIgnoredTags(scan.playlist, first.ignorables);
        const second = convert(withoutIgnored);
        if (second.kind === ConversionKind.converted) {
            return checkPlaylist({ playlist: second.playlist, violations: scan.violations, policy });
        }
        assertCondition(second.ignorables.length === 0, "A tag stayed ignorable after every ignorable tag was removed.");
        return malformedParse(second.broken);
    }

    return Object.freeze({ safeParse });
}
