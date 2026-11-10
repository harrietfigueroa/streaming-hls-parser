// The playlist schemas. This module is pure: buildSchemas composes a tag
// table's shapes into the schemas of each unit and each kind of playlist,
// which convert a scanned playlist's raw values in one safeParse.
import { z } from "zod";

import { assertCondition } from "./assert.js";
import { IgnoredKind, type RawTag, type RawTags } from "./scan.js";
import { OccurrenceKind, PlaylistKind, type TagEntry, type TagTables } from "./tag-table.js";

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

/** Builds the unit and playlist schemas over `tables`' tag shapes. */
export function buildSchemas(tables: TagTables) {
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
    // A playlist's tags without its units, which a streaming parse converts once its last unit is read.
    const mediaPlaylistTagsSchema = z
        .object({ ...tables.media.playlist.shape, kind: z.literal(PlaylistKind.media), ignored: ignoredLinesSchema })
        .readonly();
    const multivariantPlaylistTagsSchema = z
        .object({
            ...tables.multivariant.playlist.shape,
            kind: z.literal(PlaylistKind.multivariant),
            variables: z.map(z.string(), z.string()).readonly().optional(),
            ignored: ignoredLinesSchema,
        })
        .readonly();
    // The tags a segment's sequence numbers start from, which precede every segment.
    const sequenceTagsSchema = z.object({
        "EXT-X-MEDIA-SEQUENCE": tables.media.playlist.shape["EXT-X-MEDIA-SEQUENCE"],
        "EXT-X-DISCONTINUITY-SEQUENCE": tables.media.playlist.shape["EXT-X-DISCONTINUITY-SEQUENCE"],
    });
    return {
        segmentSchema,
        pendingSegmentSchema,
        mediaPlaylistSchema,
        variantSchema,
        multivariantPlaylistSchema,
        mediaPlaylistTagsSchema,
        multivariantPlaylistTagsSchema,
        sequenceTagsSchema,
    };
}

/** The schemas buildSchemas builds. */
export type Schemas = ReturnType<typeof buildSchemas>;

function valueOf(tag: RawTag) {
    return tag.value;
}

/** Gives each tag name its raw value, or a repeated tag's raw values in line order. */
export function toTagValues(tags: RawTags, entries: ReadonlyMap<string, TagEntry>) {
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

/** A converted Media Playlist, before its segments' fields are resolved. */
export type ConvertedMediaPlaylist = z.output<ReturnType<typeof buildSchemas>["mediaPlaylistSchema"]>;

/** A converted Media Segment, before its fields are resolved. */
export type ConvertedMediaSegment = z.output<ReturnType<typeof buildSchemas>["segmentSchema"]>;

/** A converted pending Parent Segment, before its fields are resolved. */
export type ConvertedPendingSegment = NonNullable<ConvertedMediaPlaylist["pendingSegment"]>;

/** A converted Multivariant Playlist. */
export type ConvertedMultivariantPlaylist = z.output<ReturnType<typeof buildSchemas>["multivariantPlaylistSchema"]>;

/** A converted Variant Stream: its EXT-X-STREAM-INF and the URI line after it. */
export type ConvertedVariant = z.output<ReturnType<typeof buildSchemas>["variantSchema"]>;

/** A converted playlist of either kind. */
export type ConvertedPlaylist = ConvertedMediaPlaylist | ConvertedMultivariantPlaylist;
