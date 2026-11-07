// The factory of decision 18. createHLS builds the unit schemas from a tag
// table once, and returns the HLS namespace whose safeParse scans text into
// raw units, converts them with one safeParse, and checks the rules that span
// units. The two entry points differ only in the table they pass.
import { z } from "zod";

import { checkSegmentDuration } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { assertCondition } from "./assert.js";
import { defaultPolicy, type Policy } from "./policy.js";
import { CheckKind, type Issue, Severity } from "./rule.js";
import { IgnoredKind, type RawPlaylist, type RawSegment, type RawTag, ScanKind, scanPlaylist } from "./scan.js";
import { classifySchemaIssue, type IgnorableTag, SchemaIssueKind, withIgnoredTags } from "./schema-issues.js";
import type { TagEntry, TagTables } from "./tag-table.js";

export const PlaylistKind = { media: "media" } as const;
export type PlaylistKind = (typeof PlaylistKind)[keyof typeof PlaylistKind];

export const ParseKind = { parsed: "parsed", malformed: "malformed" } as const;
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

function toTagValues(tags: ReadonlyMap<string, RawTag>) {
    const values: Record<string, unknown> = {};
    for (const [name, tag] of tags) {
        values[name] = tag.value;
    }
    return values;
}

function toSegmentInput(segment: RawSegment) {
    const values = toTagValues(segment.tags);
    return { ...values, uri: segment.uri, ignored: segment.ignored };
}

function toPlaylistInput(playlist: RawPlaylist) {
    const values = toTagValues(playlist.tags);
    const segments = Array.from(playlist.segments, toSegmentInput);
    return { ...values, kind: PlaylistKind.media, segments, ignored: playlist.ignored };
}

/** Checks the rules spanning a converted playlist's units, resolving each issue through `policy`. */
function checkPlaylist(options: {
    readonly playlist: MediaPlaylist;
    readonly violations: readonly Issue[];
    readonly policy: Policy;
}) {
    const { playlist, policy } = options;
    const malformedIssues: Issue[] = [];
    const violations = Array.from(options.violations);
    const targetDuration = playlist["EXT-X-TARGETDURATION"];
    for (const [segmentIndex, segment] of playlist.segments.entries()) {
        const duration = segment.EXTINF.duration;
        const check = checkSegmentDuration({ targetDuration, duration, segmentIndex });
        if (check.kind === CheckKind.passed) {
            continue;
        }
        if (policy(check.issue.rule) === Severity.malformed) {
            malformedIssues.push(check.issue);
        } else {
            violations.push(check.issue);
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
        const input = toPlaylistInput(playlist);
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

    function safeParse(text: string) {
        const scan = scanPlaylist({ text, playlistTagEntries, segmentTagEntries, policy });
        if (scan.kind === ScanKind.malformed) {
            return malformedParse([scan.issue]);
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
