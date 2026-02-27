// Basic tags
import { EXT_X_VERSION_CODEC, TAG as EXT_X_VERSION_TAG } from './basic-tags/EXT-X-VERSION/schema';
import { EXTM3U_CODEC, TAG as EXTM3U_TAG } from './basic-tags/EXTM3U/schema';

// Media or multivariant playlist tags
import {
    EXT_X_INDEPENDENT_SEGMENTS_CODEC,
    TAG as EXT_X_INDEPENDENT_SEGMENTS_TAG,
} from './media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/schema';
import {
    EXT_X_START_CODEC,
    TAG as EXT_X_START_TAG,
} from './media-or-multivariant-playlist-tags/EXT-X-START/schema';

// Media playlist tags
import {
    EXT_X_DISCONTINUITY_SEQUENCE_CODEC,
    TAG as EXT_X_DISCONTINUITY_SEQUENCE_TAG,
} from './media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/schemas';
import {
    EXT_X_ENDLIST_CODEC,
    TAG as EXT_X_ENDLIST_TAG,
} from './media-playlist-tags/EXT-X-ENDLIST/schema';
import {
    EXT_X_I_FRAMES_ONLY_CODEC,
    TAG as EXT_X_I_FRAMES_ONLY_TAG,
} from './media-playlist-tags/EXT-X-I-FRAMES-ONLY/schema';
import {
    EXT_X_MEDIA_SEQUENCE_CODEC,
    TAG as EXT_X_MEDIA_SEQUENCE_TAG,
} from './media-playlist-tags/EXT-X-MEDIA-SEQUENCE/schema';
import {
    EXT_X_PLAYLIST_TYPE_CODEC,
    TAG as EXT_X_PLAYLIST_TYPE_TAG,
} from './media-playlist-tags/EXT-X-PLAYLIST-TYPE/schema';
import {
    EXT_X_TARGETDURATION_CODEC,
    TAG as EXT_X_TARGETDURATION_TAG,
} from './media-playlist-tags/EXT-X-TARGETDURATION/schema';

// Multivariant playlist tags
import {
    EXT_X_I_FRAME_STREAM_INF_CODEC,
    TAG as EXT_X_I_FRAME_STREAM_INF_TAG,
} from './multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/schema';
import {
    EXT_X_MEDIA_CODEC,
    TAG as EXT_X_MEDIA_TAG,
} from './multivariant-playlist-tags/EXT-X-MEDIA/schema';
import {
    EXT_X_SESSION_DATA_CODEC,
    TAG as EXT_X_SESSION_DATA_TAG,
} from './multivariant-playlist-tags/EXT-X-SESSION-DATA/schema';
import {
    EXT_X_SESSION_KEY_CODEC,
    TAG as EXT_X_SESSION_KEY_TAG,
} from './multivariant-playlist-tags/EXT-X-SESSION-KEY/schema';
import {
    EXT_X_STREAM_INF_CODEC,
    TAG as EXT_X_STREAM_INF_TAG,
} from './multivariant-playlist-tags/EXT-X-STREAM-INF/schema';

// Media segment tags
import { EXT_X_BYTERANGE_CODEC } from './media-segment-tags/EXT-X-BYTERANGE/schema';
import {
    EXT_X_DATERANGE_CODEC,
    TAG as EXT_X_DATERANGE_TAG,
} from './media-segment-tags/EXT-X-DATERANGE/schema';
import {
    EXT_X_DISCONTINUITY_CODEC,
    TAG as EXT_X_DISCONTINUITY_TAG,
} from './media-segment-tags/EXT-X-DISCONTINUITY/schema';
import { EXT_X_KEY_CODEC, TAG as EXT_X_KEY_TAG } from './media-segment-tags/EXT-X-KEY/schema';
import { EXT_X_MAP_CODEC, TAG as EXT_X_MAP_TAG } from './media-segment-tags/EXT-X-MAP/schema';
import {
    EXT_X_PROGRAM_DATE_TIME_CODEC,
    TAG as EXT_X_PROGRAM_DATE_TIME_TAG,
} from './media-segment-tags/EXT-X-PROGRAM-DATE-TIME/schema';

export const playlistTagRegistry = {
    // Basic tags
    [EXTM3U_TAG]: EXTM3U_CODEC,
    [EXT_X_VERSION_TAG]: EXT_X_VERSION_CODEC,

    // Media or multivariant playlist tags
    [EXT_X_INDEPENDENT_SEGMENTS_TAG]: EXT_X_INDEPENDENT_SEGMENTS_CODEC,
    [EXT_X_START_TAG]: EXT_X_START_CODEC,

    // Media playlist tags
    [EXT_X_DISCONTINUITY_SEQUENCE_TAG]: EXT_X_DISCONTINUITY_SEQUENCE_CODEC,
    [EXT_X_ENDLIST_TAG]: EXT_X_ENDLIST_CODEC,
    [EXT_X_I_FRAMES_ONLY_TAG]: EXT_X_I_FRAMES_ONLY_CODEC,
    [EXT_X_MEDIA_SEQUENCE_TAG]: EXT_X_MEDIA_SEQUENCE_CODEC,
    [EXT_X_PLAYLIST_TYPE_TAG]: EXT_X_PLAYLIST_TYPE_CODEC,
    [EXT_X_TARGETDURATION_TAG]: EXT_X_TARGETDURATION_CODEC,

    // Multivariant playlist tags
    [EXT_X_I_FRAME_STREAM_INF_TAG]: EXT_X_I_FRAME_STREAM_INF_CODEC,
    [EXT_X_MEDIA_TAG]: EXT_X_MEDIA_CODEC,
    [EXT_X_SESSION_DATA_TAG]: EXT_X_SESSION_DATA_CODEC,
    [EXT_X_SESSION_KEY_TAG]: EXT_X_SESSION_KEY_CODEC,
    [EXT_X_STREAM_INF_TAG]: EXT_X_STREAM_INF_CODEC,

    // Media segment tags
    '#EXT-X-BYTERANGE': EXT_X_BYTERANGE_CODEC,
    [EXT_X_DATERANGE_TAG]: EXT_X_DATERANGE_CODEC,
    [EXT_X_DISCONTINUITY_TAG]: EXT_X_DISCONTINUITY_CODEC,
    [EXT_X_KEY_TAG]: EXT_X_KEY_CODEC,
    [EXT_X_MAP_TAG]: EXT_X_MAP_CODEC,
    [EXT_X_PROGRAM_DATE_TIME_TAG]: EXT_X_PROGRAM_DATE_TIME_CODEC,
};
