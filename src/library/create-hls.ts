// The factory of decision 18. createHLS builds the unit schemas from a tag
// table once, and returns the HLS namespace whose safeParse scans text into
// raw units, converts them with one safeParse, and checks the rules that span
// units. The two entry points differ only in the table they pass.
import { z } from "zod";

import { checkSegmentDuration } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { assertCondition } from "./assert.js";
import { defaultPolicy, type Policy } from "./policy.js";
import { CheckKind, type Issue, Severity } from "./rule.js";
import { IgnoredKind, type RawPlaylist, type RawSegment, ScanKind, scanPlaylist } from "./scan.js";
import type { TagRules, TagTables } from "./tag-table.js";

export const PlaylistKind = { media: "media" } as const;
export type PlaylistKind = (typeof PlaylistKind)[keyof typeof PlaylistKind];

export const ParseKind = { parsed: "parsed", malformed: "malformed" } as const;
export type ParseKind = (typeof ParseKind)[keyof typeof ParseKind];

const ignoredLinesSchema = z
    .array(z.object({ kind: z.enum(IgnoredKind), line: z.string() }).readonly())
    .readonly();

const SEGMENTS_KEY = "segments";
// A segment tag's issue path is ["segments", segmentIndex, tagName, ...].
const SEGMENT_TAG_PATH_LENGTH_MIN = 3;

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

function malformedParse(issues: readonly Issue[]) {
    const malformed: Parse = { kind: ParseKind.malformed, issues };
    return malformed;
}

/** Maps each tag name to its rules, asserting the table states a required rule exactly for the tags whose schema rejects absence. */
function toRulesMap(unit: { readonly shape: Readonly<Record<string, z.ZodType>>; readonly rules: Readonly<Record<string, TagRules>> }) {
    const rulesMap = new Map(Object.entries(unit.rules));
    for (const [name, schema] of Object.entries(unit.shape)) {
        const rules = rulesMap.get(name);
        assertCondition(rules !== undefined, `Tag ${name} has a schema and no rules.`);
        const acceptsAbsence = schema.safeParse(undefined).success;
        const hasRequiredRule = rules.required !== undefined;
        assertCondition(acceptsAbsence !== hasRequiredRule, `Tag ${name}'s required rule disagrees with its schema.`);
    }
    assertCondition(rulesMap.size === Object.keys(unit.shape).length, "The rules map names a tag the shape lacks.");
    return rulesMap;
}

function toSegmentInput(segment: RawSegment) {
    return { ...Object.fromEntries(segment.tags), uri: segment.uri, ignored: segment.ignored };
}

function toPlaylistInput(playlist: RawPlaylist) {
    const segments = Array.from(playlist.segments, toSegmentInput);
    return { ...Object.fromEntries(playlist.tags), kind: PlaylistKind.media, segments, ignored: playlist.ignored };
}

function tagIssue(options: {
    readonly rules: TagRules;
    readonly isPresent: boolean;
    readonly location: string;
    readonly message: string;
}) {
    const { rules, isPresent, location, message } = options;
    if (isPresent) {
        return { rule: rules.format, detail: `${location}: ${message}` };
    }
    assertCondition(rules.required !== undefined, `${location} is absent and has no required rule.`);
    return { rule: rules.required, detail: `${location} is absent.` };
}

/** Creates the HLS namespace over `tables`, whose schemas are either as declared or compiled. */
export function createHLS(tables: TagTables) {
    const schemas = buildSchemas(tables);
    const playlistTagRules = toRulesMap(tables.playlist);
    const segmentTagRules = toRulesMap(tables.segment);
    const policy: Policy = defaultPolicy;

    /** Maps one zod issue, which the library's own keys never produce, to the rule its tag breaks. */
    function toSchemaIssue(issue: z.core.$ZodIssue, playlist: RawPlaylist) {
        const [head, segmentIndex, segmentTagName] = issue.path;
        const isStringKey = typeof head === "string";
        const isPlaylistTag = isStringKey && head !== SEGMENTS_KEY;
        if (isPlaylistTag) {
            const rules = playlistTagRules.get(head);
            assertCondition(rules !== undefined, `Schema issue at unknown playlist key ${head}.`);
            const isPresent = playlist.tags.has(head);
            return tagIssue({ rules, isPresent, location: head, message: issue.message });
        }
        assertCondition(issue.path.length >= SEGMENT_TAG_PATH_LENGTH_MIN, `Schema issue at ${issue.path.join(".")}.`);
        assertCondition(typeof segmentIndex === "number", `Segment index ${String(segmentIndex)} is not a number.`);
        assertCondition(typeof segmentTagName === "string", `Segment key ${String(segmentTagName)} is not a string.`);
        const rules = segmentTagRules.get(segmentTagName);
        assertCondition(rules !== undefined, `Schema issue at unknown segment key ${segmentTagName}.`);
        const segment = playlist.segments[segmentIndex];
        assertCondition(segment !== undefined, `Schema issue at missing segment ${segmentIndex}.`);
        const isPresent = segment.tags.has(segmentTagName);
        const location = `Segment ${segmentIndex + 1} ${segmentTagName}`;
        return tagIssue({ rules, isPresent, location, message: issue.message });
    }

    function safeParse(text: string) {
        const scan = scanPlaylist({ text, playlistTagRules, segmentTagRules, policy });
        if (scan.kind === ScanKind.malformed) {
            return malformedParse([scan.issue]);
        }
        const input = toPlaylistInput(scan.playlist);
        const result = schemas.mediaPlaylistSchema.safeParse(input);
        // A value failing its schema has no typed form to place in the playlist, so a schema issue is
        // malformed under every policy.
        if (!result.success) {
            const issues: Issue[] = [];
            for (const issue of result.error.issues) {
                const schemaIssue = toSchemaIssue(issue, scan.playlist);
                issues.push(schemaIssue);
            }
            return malformedParse(issues);
        }
        const playlist = result.data;
        const malformedIssues: Issue[] = [];
        const violations = Array.from(scan.violations);
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

    return Object.freeze({ safeParse });
}
