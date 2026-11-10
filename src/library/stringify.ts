// The canonical writer. This module is pure: it writes a playlist or a unit
// from its data alone, so it writes a spread or a value built by hand as it
// writes parsed output. Each unit's ignored lines come first, as written, then
// its tags in one fixed order, then its URI; resolved fields are not written,
// since the tags they come from are. Parsing the written text gives back the
// same data.
import { writeTag } from "../4-playlists/4.1-definition-of-a-playlist.js";
import { writeAsIs, writeAttributeList, writeDecimalInteger } from "../4-playlists/4.2-attribute-lists.js";
import { EXTM3U_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import { EXT_X_VERSION_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.2-ext-x-version.js";
import { EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.1-ext-x-independent-segments.js";
import {
    EXT_X_START_TAG_NAME,
    extXStartAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.2-ext-x-start.js";
import {
    EXT_X_DEFINE_TAG_NAME,
    extXDefineAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";
import { EXT_X_TARGETDURATION_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { EXT_X_MEDIA_SEQUENCE_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.2-ext-x-media-sequence.js";
import { EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.3-ext-x-discontinuity-sequence.js";
import { EXT_X_ENDLIST_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.4-ext-x-endlist.js";
import { EXT_X_PLAYLIST_TYPE_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.5-ext-x-playlist-type.js";
import { EXT_X_I_FRAMES_ONLY_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.6-ext-x-i-frames-only.js";
import {
    EXT_X_PART_INF_TAG_NAME,
    extXPartInfAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";
import {
    EXT_X_SERVER_CONTROL_TAG_NAME,
    extXServerControlAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";
import { EXTINF_TAG_NAME, writeExtinfValue } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.1-extinf.js";
import { EXT_X_BYTERANGE_TAG_NAME, writeByteRange } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import { EXT_X_DISCONTINUITY_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.3-ext-x-discontinuity.js";
import { EXT_X_KEY_TAG_NAME, keyAttributeWriters } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import { EXT_X_MAP_TAG_NAME, extXMapAttributeWriters } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.5-ext-x-map.js";
import { EXT_X_PROGRAM_DATE_TIME_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.6-ext-x-program-date-time.js";
import { EXT_X_GAP_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.7-ext-x-gap.js";
import { EXT_X_BITRATE_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.8-ext-x-bitrate.js";
import { EXT_X_PART_TAG_NAME, extXPartAttributeWriters } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";
import {
    EXT_X_DATERANGE_TAG_NAME,
    writeDateRangeAttributes,
} from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.1-ext-x-daterange.js";
import { EXT_X_SKIP_TAG_NAME, extXSkipAttributeWriters } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.2-ext-x-skip.js";
import {
    EXT_X_PRELOAD_HINT_TAG_NAME,
    extXPreloadHintAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.3-ext-x-preload-hint.js";
import {
    EXT_X_RENDITION_REPORT_TAG_NAME,
    extXRenditionReportAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.4-ext-x-rendition-report.js";
import {
    EXT_X_MEDIA_TAG_NAME,
    extXMediaAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import {
    EXT_X_STREAM_INF_TAG_NAME,
    extXStreamInfAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";
import {
    EXT_X_I_FRAME_STREAM_INF_TAG_NAME,
    extXIFrameStreamInfAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.3-ext-x-i-frame-stream-inf.js";
import { EXT_X_SESSION_DATA_TAG_NAME, extXSessionDataAttributeWriters } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.4-ext-x-session-data.js";
import { EXT_X_SESSION_KEY_TAG_NAME } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.5-ext-x-session-key.js";
import {
    EXT_X_CONTENT_STEERING_TAG_NAME,
    extXContentSteeringAttributeWriters,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.6-ext-x-content-steering.js";
import { unreachable } from "./assert.js";
import type { IgnoredLine } from "./scan.js";
import type {
    ConvertedMediaPlaylist,
    ConvertedMediaSegment,
    ConvertedMultivariantPlaylist,
    ConvertedPendingSegment,
    ConvertedVariant,
} from "./schemas.js";
import { PlaylistKind } from "./tag-table.js";

const LINE_TERMINATOR = "\n";

/** A value HLS.stringify writes: a playlist of either kind, a Media Segment, the pending Parent Segment, or a Variant Stream. */
export type Stringifiable =
    | ConvertedMediaPlaylist
    | ConvertedMultivariantPlaylist
    | ConvertedMediaSegment
    | ConvertedPendingSegment
    | ConvertedVariant;

/** The tags both kinds of playlist hold, sections 4.4.1 and 4.4.2's. */
type SharedPlaylistTags = Pick<
    ConvertedMediaPlaylist,
    typeof EXT_X_VERSION_TAG_NAME | typeof EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME | typeof EXT_X_START_TAG_NAME | typeof EXT_X_DEFINE_TAG_NAME
>;

function* ignoredLines(ignored: readonly IgnoredLine[]) {
    for (const ignoredLine of ignored) {
        yield ignoredLine.line;
    }
}

function* sharedPlaylistLines(playlist: SharedPlaylistTags) {
    yield writeTag({ name: EXTM3U_TAG_NAME });
    const version = playlist[EXT_X_VERSION_TAG_NAME];
    if (version !== undefined) {
        yield writeTag({ name: EXT_X_VERSION_TAG_NAME, value: writeDecimalInteger(version) });
    }
    if (playlist[EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME] === true) {
        yield writeTag({ name: EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME });
    }
    const start = playlist[EXT_X_START_TAG_NAME];
    if (start !== undefined) {
        yield writeTag({ name: EXT_X_START_TAG_NAME, value: writeAttributeList(start, extXStartAttributeWriters) });
    }
    const defines = playlist[EXT_X_DEFINE_TAG_NAME];
    if (defines !== undefined) {
        for (const define of defines) {
            yield writeTag({ name: EXT_X_DEFINE_TAG_NAME, value: writeAttributeList(define, extXDefineAttributeWriters) });
        }
    }
}

// Section 4.4.4.9 puts a Parent Segment's tags before its first EXT-X-PART, and EXTINF and the URI close it.
function* segmentTagLines(segment: ConvertedPendingSegment) {
    if (segment[EXT_X_DISCONTINUITY_TAG_NAME] === true) {
        yield writeTag({ name: EXT_X_DISCONTINUITY_TAG_NAME });
    }
    const keys = segment[EXT_X_KEY_TAG_NAME];
    if (keys !== undefined) {
        for (const key of keys) {
            yield writeTag({ name: EXT_X_KEY_TAG_NAME, value: writeAttributeList(key, keyAttributeWriters) });
        }
    }
    const map = segment[EXT_X_MAP_TAG_NAME];
    if (map !== undefined) {
        yield writeTag({ name: EXT_X_MAP_TAG_NAME, value: writeAttributeList(map, extXMapAttributeWriters) });
    }
    const programDateTime = segment[EXT_X_PROGRAM_DATE_TIME_TAG_NAME];
    if (programDateTime !== undefined) {
        yield writeTag({ name: EXT_X_PROGRAM_DATE_TIME_TAG_NAME, value: programDateTime });
    }
    const bitrate = segment[EXT_X_BITRATE_TAG_NAME];
    if (bitrate !== undefined) {
        yield writeTag({ name: EXT_X_BITRATE_TAG_NAME, value: writeDecimalInteger(bitrate) });
    }
    if (segment[EXT_X_GAP_TAG_NAME] === true) {
        yield writeTag({ name: EXT_X_GAP_TAG_NAME });
    }
    const parts = segment[EXT_X_PART_TAG_NAME];
    if (parts !== undefined) {
        for (const part of parts) {
            yield writeTag({ name: EXT_X_PART_TAG_NAME, value: writeAttributeList(part, extXPartAttributeWriters) });
        }
    }
    const byteRange = segment[EXT_X_BYTERANGE_TAG_NAME];
    if (byteRange !== undefined) {
        yield writeTag({ name: EXT_X_BYTERANGE_TAG_NAME, value: writeByteRange(byteRange) });
    }
    const extinf = segment[EXTINF_TAG_NAME];
    if (extinf !== undefined) {
        yield writeTag({ name: EXTINF_TAG_NAME, value: writeExtinfValue(extinf) });
    }
}

function* pendingSegmentLines(segment: ConvertedPendingSegment) {
    yield* ignoredLines(segment.ignored);
    yield* segmentTagLines(segment);
}

function* mediaSegmentLines(segment: ConvertedMediaSegment) {
    yield* pendingSegmentLines(segment);
    yield segment.uri;
}

function* variantLines(variant: ConvertedVariant) {
    yield* ignoredLines(variant.ignored);
    const streamInf = variant[EXT_X_STREAM_INF_TAG_NAME];
    yield writeTag({ name: EXT_X_STREAM_INF_TAG_NAME, value: writeAttributeList(streamInf, extXStreamInfAttributeWriters) });
    yield variant.uri;
}

// The tags that apply to the whole playlist come before the segments, and those describing its end after them.
function* mediaPlaylistLines(playlist: ConvertedMediaPlaylist) {
    yield* sharedPlaylistLines(playlist);
    yield writeTag({ name: EXT_X_TARGETDURATION_TAG_NAME, value: writeDecimalInteger(playlist[EXT_X_TARGETDURATION_TAG_NAME]) });
    const mediaSequence = playlist[EXT_X_MEDIA_SEQUENCE_TAG_NAME];
    if (mediaSequence !== undefined) {
        yield writeTag({ name: EXT_X_MEDIA_SEQUENCE_TAG_NAME, value: writeDecimalInteger(mediaSequence) });
    }
    const discontinuitySequence = playlist[EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME];
    if (discontinuitySequence !== undefined) {
        yield writeTag({ name: EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME, value: writeDecimalInteger(discontinuitySequence) });
    }
    const playlistType = playlist[EXT_X_PLAYLIST_TYPE_TAG_NAME];
    if (playlistType !== undefined) {
        yield writeTag({ name: EXT_X_PLAYLIST_TYPE_TAG_NAME, value: writeAsIs(playlistType) });
    }
    if (playlist[EXT_X_I_FRAMES_ONLY_TAG_NAME] === true) {
        yield writeTag({ name: EXT_X_I_FRAMES_ONLY_TAG_NAME });
    }
    const partInf = playlist[EXT_X_PART_INF_TAG_NAME];
    if (partInf !== undefined) {
        yield writeTag({ name: EXT_X_PART_INF_TAG_NAME, value: writeAttributeList(partInf, extXPartInfAttributeWriters) });
    }
    const serverControl = playlist[EXT_X_SERVER_CONTROL_TAG_NAME];
    if (serverControl !== undefined) {
        yield writeTag({ name: EXT_X_SERVER_CONTROL_TAG_NAME, value: writeAttributeList(serverControl, extXServerControlAttributeWriters) });
    }
    const dateRanges = playlist[EXT_X_DATERANGE_TAG_NAME];
    if (dateRanges !== undefined) {
        for (const dateRange of dateRanges) {
            yield writeTag({ name: EXT_X_DATERANGE_TAG_NAME, value: writeDateRangeAttributes(dateRange) });
        }
    }
    const skip = playlist[EXT_X_SKIP_TAG_NAME];
    if (skip !== undefined) {
        yield writeTag({ name: EXT_X_SKIP_TAG_NAME, value: writeAttributeList(skip, extXSkipAttributeWriters) });
    }
    for (const segment of playlist.segments) {
        yield* mediaSegmentLines(segment);
    }
    if (playlist.pendingSegment !== undefined) {
        yield* pendingSegmentLines(playlist.pendingSegment);
    }
    const preloadHints = playlist[EXT_X_PRELOAD_HINT_TAG_NAME];
    if (preloadHints !== undefined) {
        for (const preloadHint of preloadHints) {
            yield writeTag({ name: EXT_X_PRELOAD_HINT_TAG_NAME, value: writeAttributeList(preloadHint, extXPreloadHintAttributeWriters) });
        }
    }
    const renditionReports = playlist[EXT_X_RENDITION_REPORT_TAG_NAME];
    if (renditionReports !== undefined) {
        for (const report of renditionReports) {
            yield writeTag({ name: EXT_X_RENDITION_REPORT_TAG_NAME, value: writeAttributeList(report, extXRenditionReportAttributeWriters) });
        }
    }
    if (playlist[EXT_X_ENDLIST_TAG_NAME] === true) {
        yield writeTag({ name: EXT_X_ENDLIST_TAG_NAME });
    }
    yield* ignoredLines(playlist.ignored);
}

function* multivariantPlaylistLines(playlist: ConvertedMultivariantPlaylist) {
    yield* sharedPlaylistLines(playlist);
    const renditions = playlist[EXT_X_MEDIA_TAG_NAME];
    if (renditions !== undefined) {
        for (const media of renditions) {
            yield writeTag({ name: EXT_X_MEDIA_TAG_NAME, value: writeAttributeList(media, extXMediaAttributeWriters) });
        }
    }
    const sessionData = playlist[EXT_X_SESSION_DATA_TAG_NAME];
    if (sessionData !== undefined) {
        for (const data of sessionData) {
            yield writeTag({ name: EXT_X_SESSION_DATA_TAG_NAME, value: writeAttributeList(data, extXSessionDataAttributeWriters) });
        }
    }
    const sessionKeys = playlist[EXT_X_SESSION_KEY_TAG_NAME];
    if (sessionKeys !== undefined) {
        for (const key of sessionKeys) {
            yield writeTag({ name: EXT_X_SESSION_KEY_TAG_NAME, value: writeAttributeList(key, keyAttributeWriters) });
        }
    }
    const contentSteering = playlist[EXT_X_CONTENT_STEERING_TAG_NAME];
    if (contentSteering !== undefined) {
        yield writeTag({ name: EXT_X_CONTENT_STEERING_TAG_NAME, value: writeAttributeList(contentSteering, extXContentSteeringAttributeWriters) });
    }
    const iFrameStreamInfs = playlist[EXT_X_I_FRAME_STREAM_INF_TAG_NAME];
    if (iFrameStreamInfs !== undefined) {
        for (const iFrameStreamInf of iFrameStreamInfs) {
            yield writeTag({ name: EXT_X_I_FRAME_STREAM_INF_TAG_NAME, value: writeAttributeList(iFrameStreamInf, extXIFrameStreamInfAttributeWriters) });
        }
    }
    for (const variant of playlist.variants) {
        yield* variantLines(variant);
    }
    yield* ignoredLines(playlist.ignored);
}

function linesOf(value: Stringifiable) {
    if ("kind" in value) {
        switch (value.kind) {
            case PlaylistKind.media: {
                return mediaPlaylistLines(value);
            }
            case PlaylistKind.multivariant: {
                return multivariantPlaylistLines(value);
            }
            default: {
                value satisfies never;
                return unreachable(value);
            }
        }
    }
    if (EXT_X_STREAM_INF_TAG_NAME in value) {
        return variantLines(value);
    }
    if ("uri" in value) {
        return mediaSegmentLines(value);
    }
    return pendingSegmentLines(value);
}

/** Writes `value` in the canonical form, one line per tag, ignored line, or URI, each ending in a line feed. */
export function stringify(value: Stringifiable) {
    const lines = linesOf(value);
    let text = "";
    for (const line of lines) {
        text += `${line}${LINE_TERMINATOR}`;
    }
    return text;
}
