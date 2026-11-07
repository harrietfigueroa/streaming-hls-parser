// Resolved fields. This module is pure: it walks a converted Media Playlist's
// segments once, in order, and computes for each the carry-forward tags that
// apply to it, so a segment read alone carries its keys, its Media
// Initialization Section, its bit rate, its whole byte range, and its sequence
// numbers. Each key, map, and bit rate is the written tag's own value.
import {
    ByteRangeResolutionKind,
    resolveByteRange,
} from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import { applyKeys } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import type { ConvertedMediaPlaylist, ConvertedMediaSegment, ConvertedPendingSegment } from "./schemas.js";

type WrittenKey = NonNullable<ConvertedMediaSegment["EXT-X-KEY"]>[number];
type WrittenMap = NonNullable<ConvertedMediaSegment["EXT-X-MAP"]>;

/** The fields the library adds to each segment from the tags written before it. */
export type ResolvedFields = {
    /** The EXT-X-KEY tags applying to the segment, one per KEYFORMAT; empty when it is unencrypted (section 4.4.4.4). */
    readonly keys: readonly WrittenKey[];
    /** The EXT-X-MAP applying to the segment (section 4.4.4.5). */
    readonly map?: WrittenMap;
    /** The EXT-X-BITRATE applying to the segment, absent on a segment with an EXT-X-BYTERANGE (section 4.4.4.8). */
    readonly bitrate?: bigint;
    /** The segment's EXT-X-BYTERANGE with its offset resolved (section 4.4.4.2). */
    readonly byteRange?: Readonly<{ length: bigint; offset: bigint }>;
    /** The segment's Media Sequence Number (section 4.4.3.2). */
    readonly mediaSequenceNumber: bigint;
    /** The segment's Discontinuity Sequence Number (section 4.4.3.3). */
    readonly discontinuitySequenceNumber: bigint;
};

type MutableFields = { -readonly [Field in keyof ResolvedFields]: ResolvedFields[Field] };


/** What carries from one segment to the next: the tags still applying, and the previous sub-range. */
type Carried = {
    readonly keys: readonly WrittenKey[];
    readonly map: WrittenMap | undefined;
    readonly bitrate: bigint | undefined;
    readonly mediaSequenceNumber: bigint;
    readonly discontinuitySequenceNumber: bigint;
    /** The end of the previous segment's sub-range and its URI, when the previous segment is a sub-range. */
    readonly previousRange: { readonly uri: string; readonly end: bigint } | undefined;
};

const NO_KEYS: readonly WrittenKey[] = Object.freeze([]);
// A playlist lacking EXT-X-MEDIA-SEQUENCE or EXT-X-DISCONTINUITY-SEQUENCE numbers its first segment 0
// (sections 4.4.3.2 and 4.4.3.3), and each number counts up by one.
const IMPLICIT_FIRST_SEQUENCE_NUMBER = 0n;
const SEQUENCE_STEP = 1n;

/** One segment's resolved fields from the state carried to it, and the state it carries on. */
function resolveUnit(options: { readonly unit: ConvertedMediaSegment | ConvertedPendingSegment; readonly carried: Carried }) {
    const { unit, carried } = options;
    const writtenKeys = unit["EXT-X-KEY"];
    let keys = carried.keys;
    if (writtenKeys !== undefined) {
        keys = applyKeys({ applying: carried.keys, written: writtenKeys });
    }
    let map = carried.map;
    if (unit["EXT-X-MAP"] !== undefined) {
        map = unit["EXT-X-MAP"];
    }
    let bitrate = carried.bitrate;
    if (unit["EXT-X-BITRATE"] !== undefined) {
        bitrate = unit["EXT-X-BITRATE"];
    }
    let discontinuitySequenceNumber = carried.discontinuitySequenceNumber;
    if (unit["EXT-X-DISCONTINUITY"] === true) {
        discontinuitySequenceNumber += SEQUENCE_STEP;
    }
    const fields: MutableFields = { keys, mediaSequenceNumber: carried.mediaSequenceNumber, discontinuitySequenceNumber };
    if (map !== undefined) {
        fields.map = map;
    }
    const writtenRange = unit["EXT-X-BYTERANGE"];
    const appliedBitrate = bitrate;
    const hasBitrate = appliedBitrate !== undefined && writtenRange === undefined;
    if (hasBitrate) {
        fields.bitrate = appliedBitrate;
    }
    const mediaSequenceNumber = carried.mediaSequenceNumber + SEQUENCE_STEP;
    const next = { keys, map, bitrate, mediaSequenceNumber, discontinuitySequenceNumber };
    return { fields, next };
}

/** Resolves the byte range of a segment, given the previous segment's sub-range, and the sub-range it carries on. */
function resolveSegmentRange(options: { readonly segment: ConvertedMediaSegment; readonly previousRange: Carried["previousRange"] }) {
    const { segment, previousRange } = options;
    const byteRange = segment["EXT-X-BYTERANGE"];
    if (byteRange === undefined) {
        return { byteRange, previousRange: undefined };
    }
    let previousEnd: bigint | undefined;
    const isSameResource = previousRange !== undefined && previousRange.uri === segment.uri;
    if (isSameResource) {
        previousEnd = previousRange.end;
    }
    const resolution = resolveByteRange({ byteRange, previousEnd });
    if (resolution.kind === ByteRangeResolutionKind.unresolvable) {
        return { byteRange: undefined, previousRange: undefined };
    }
    const end = resolution.byteRange.offset + resolution.byteRange.length;
    return { byteRange: resolution.byteRange, previousRange: { uri: segment.uri, end } };
}

/** Resolves the fields of each segment of `playlist`, in order, and of its pending Parent Segment. */
export function resolveSegmentFields(playlist: ConvertedMediaPlaylist) {
    let mediaSequenceNumber = IMPLICIT_FIRST_SEQUENCE_NUMBER;
    if (playlist["EXT-X-MEDIA-SEQUENCE"] !== undefined) {
        mediaSequenceNumber = playlist["EXT-X-MEDIA-SEQUENCE"];
    }
    let discontinuitySequenceNumber = IMPLICIT_FIRST_SEQUENCE_NUMBER;
    if (playlist["EXT-X-DISCONTINUITY-SEQUENCE"] !== undefined) {
        discontinuitySequenceNumber = playlist["EXT-X-DISCONTINUITY-SEQUENCE"];
    }
    let carried: Carried = {
        keys: NO_KEYS,
        map: undefined,
        bitrate: undefined,
        mediaSequenceNumber,
        discontinuitySequenceNumber,
        previousRange: undefined,
    };
    const segments: ResolvedFields[] = [];
    for (const segment of playlist.segments) {
        const { fields, next } = resolveUnit({ unit: segment, carried });
        const range = resolveSegmentRange({ segment, previousRange: carried.previousRange });
        if (range.byteRange !== undefined) {
            fields.byteRange = range.byteRange;
        }
        segments.push(fields);
        carried = { ...next, previousRange: range.previousRange };
    }
    const pending = playlist.pendingSegment;
    if (pending === undefined) {
        return { segments, pendingSegment: undefined };
    }
    // The pending segment has no URI yet, so its byte range has no resource to resolve against.
    const { fields } = resolveUnit({ unit: pending, carried });
    return { segments, pendingSegment: fields };
}
