// The playlist schemas. This module is pure: buildSchemas composes a tag
// table's shapes into the schemas of each unit and each kind of playlist,
// which convert a scanned playlist's raw values in one safeParse.
import { z } from "zod";

import { IgnoredKind } from "./scan.js";
import { PlaylistKind, type TagTables } from "./tag-table.js";

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
    return { segmentSchema, mediaPlaylistSchema, variantSchema, multivariantPlaylistSchema };
}

/** A converted Media Playlist, before its segments' fields are resolved. */
export type ConvertedMediaPlaylist = z.output<ReturnType<typeof buildSchemas>["mediaPlaylistSchema"]>;

/** A converted Media Segment, before its fields are resolved. */
export type ConvertedMediaSegment = z.output<ReturnType<typeof buildSchemas>["segmentSchema"]>;

/** A converted pending Parent Segment, before its fields are resolved. */
export type ConvertedPendingSegment = NonNullable<ConvertedMediaPlaylist["pendingSegment"]>;

/** A parsed Multivariant Playlist. */
export type MultivariantPlaylist = z.output<ReturnType<typeof buildSchemas>["multivariantPlaylistSchema"]>;

/** A parsed Variant Stream: its EXT-X-STREAM-INF and the URI line after it. */
export type Variant = z.output<ReturnType<typeof buildSchemas>["variantSchema"]>;

/** A converted playlist of either kind. */
export type ConvertedPlaylist = ConvertedMediaPlaylist | MultivariantPlaylist;
