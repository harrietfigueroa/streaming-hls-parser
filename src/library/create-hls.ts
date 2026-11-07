// The factory of decision 18. createHLS builds the unit schemas from a tag
// table once, and returns the HLS namespace whose safeParse scans text into
// raw units, converts them with one safeParse, and checks the rules that span
// units. The two entry points differ only in the table they pass.
import { z } from "zod";

import { checkSegmentDuration } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { checkServerControl } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";
import { checkByteRangeOffsets } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import { assertCondition } from "./assert.js";
import { type Limit, type ParseOptions, resolveLimits } from "./options.js";
import { defaultPolicy, type Policy } from "./policy.js";
import { CheckKind, type Issue, Severity } from "./rule.js";
import { IgnoredKind, type RawPlaylist, type RawTag, type RawTags, ScanKind, scanPlaylist } from "./scan.js";
import {
    classifySchemaIssue,
    type EntriesMaps,
    type IgnorableTag,
    SchemaIssueKind,
    withIgnoredTags,
} from "./schema-issues.js";
import { OccurrenceKind, type TagEntry, type TagTables } from "./tag-table.js";

export const PlaylistKind = { media: "media" } as const;
export type PlaylistKind = (typeof PlaylistKind)[keyof typeof PlaylistKind];

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
            ])
            .readonly(),
    )
    .readonly();

function buildSchemas(tables: TagTables) {
    const segmentSchema = z
        .object({ ...tables.segment.shape, uri: z.string(), ignored: ignoredLinesSchema })
        .readonly();
    const segmentsSchema = z.array(segmentSchema).readonly();
    const mediaPlaylistSchema = z
        .object({
            ...tables.playlist.shape,
            kind: z.literal(PlaylistKind.media),
            segments: segmentsSchema,
            ignored: ignoredLinesSchema,
        })
        .readonly();
    return { segmentSchema, mediaPlaylistSchema };
}

/** A parsed Media Playlist, per decision 23. */
export type MediaPlaylist = z.output<ReturnType<typeof buildSchemas>["mediaPlaylistSchema"]>;

/** A parsed Media Segment, per decision 23. */
export type MediaSegment = z.output<ReturnType<typeof buildSchemas>["segmentSchema"]>;

type ParsePayloads = {
    [ParseKind.parsed]: { readonly playlist: MediaPlaylist; readonly violations: readonly Issue[] };
    [ParseKind.malformed]: { readonly issues: readonly Issue[] };
    [ParseKind.limitExceeded]: { readonly limit: Limit; readonly value: number };
};
type ParseMember<K extends ParseKind> = { readonly kind: K } & ParsePayloads[K];
/** The outcome of HLS.safeParse, per decision 7. */
export type Parse = { [K in ParseKind]: ParseMember<K> }[ParseKind];

const ConversionKind = { converted: "converted", failed: "failed" } as const;
type ConversionKind = (typeof ConversionKind)[keyof typeof ConversionKind];

type ConversionPayloads = {
    [ConversionKind.converted]: { readonly playlist: MediaPlaylist };
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

function toPlaylistInput(options: { readonly playlist: RawPlaylist } & EntriesMaps) {
    const { playlist, playlistTagEntries, segmentTagEntries } = options;
    const segments = [];
    for (const segment of playlist.segments) {
        const segmentValues = toTagValues(segment.tags, segmentTagEntries);
        segments.push({ ...segmentValues, uri: segment.uri, ignored: segment.ignored });
    }
    const values = toTagValues(playlist.tags, playlistTagEntries);
    return { ...values, kind: PlaylistKind.media, segments, ignored: playlist.ignored };
}

/** Finds every broken rule that spans a converted playlist's tags or units. */
function findPlaylistIssues(playlist: MediaPlaylist) {
    const issues: Issue[] = [];
    const targetDuration = playlist["EXT-X-TARGETDURATION"];
    for (const [segmentIndex, segment] of playlist.segments.entries()) {
        const duration = segment.EXTINF.duration;
        const check = checkSegmentDuration({ targetDuration, duration, segmentIndex });
        if (check.kind === CheckKind.failed) {
            issues.push(check.issue);
        }
    }
    const serverControl = playlist["EXT-X-SERVER-CONTROL"];
    const partTarget = playlist["EXT-X-PART-INF"]?.["PART-TARGET"];
    const serverControlIssues = checkServerControl({ serverControl, targetDuration, partTarget });
    for (const issue of serverControlIssues) {
        issues.push(issue);
    }
    const byteRangeIssues = checkByteRangeOffsets(playlist.segments);
    for (const issue of byteRangeIssues) {
        issues.push(issue);
    }
    return issues;
}

/** Checks the rules spanning a converted playlist, resolving each issue through `policy`. */
function checkPlaylist(options: {
    readonly playlist: MediaPlaylist;
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

/** Creates the HLS namespace over `tables`, whose schemas are either as declared or compiled. */
export function createHLS(tables: TagTables) {
    const schemas = buildSchemas(tables);
    const playlistTagEntries = toEntriesMap(tables.playlist);
    const segmentTagEntries = toEntriesMap(tables.segment);
    const policy: Policy = defaultPolicy;

    // A value failing its schema has no typed form to place in the playlist, so a broken rule here is
    // malformed under every policy.
    function convert(playlist: RawPlaylist) {
        const input = toPlaylistInput({ playlist, playlistTagEntries, segmentTagEntries });
        const result = schemas.mediaPlaylistSchema.safeParse(input);
        if (result.success) {
            const converted: Conversion = { kind: ConversionKind.converted, playlist: result.data };
            return converted;
        }
        const broken: Issue[] = [];
        const ignorables: IgnorableTag[] = [];
        const ignoredTags = new Set<RawTag>();
        for (const issue of result.error.issues) {
            const schemaIssue = classifySchemaIssue({ issue, playlist, playlistTagEntries, segmentTagEntries });
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
        const scan = scanPlaylist({ text, playlistTagEntries, segmentTagEntries, policy, limits, uri: options.uri });
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
