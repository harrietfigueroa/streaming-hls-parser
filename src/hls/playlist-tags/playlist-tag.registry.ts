// Basic tags
import { EXT_X_VERSION_CODEC } from './basic-tags/EXT-X-VERSION/schema';
import { EXTM3U_CODEC } from './basic-tags/EXTM3U/schema';

// Media or multivariant playlist tags
import { EXT_X_INDEPENDENT_SEGMENTS_CODEC } from './media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/schema';
import { EXT_X_START_CODEC } from './media-or-multivariant-playlist-tags/EXT-X-START/schema';
import { EXT_X_DEFINE_CODEC } from './media-or-multivariant-playlist-tags/EXT-X-DEFINE/schema';

// Media playlist tags
import { EXT_X_DISCONTINUITY_SEQUENCE_CODEC } from './media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/schemas';
import { EXT_X_ENDLIST_CODEC } from './media-playlist-tags/EXT-X-ENDLIST/schema';
import { EXT_X_I_FRAMES_ONLY_CODEC } from './media-playlist-tags/EXT-X-I-FRAMES-ONLY/schema';
import { EXT_X_MEDIA_SEQUENCE_CODEC } from './media-playlist-tags/EXT-X-MEDIA-SEQUENCE/schema';
import { EXT_X_PLAYLIST_TYPE_CODEC } from './media-playlist-tags/EXT-X-PLAYLIST-TYPE/schema';
import { EXT_X_TARGETDURATION_CODEC } from './media-playlist-tags/EXT-X-TARGETDURATION/schema';
import { EXT_X_SERVER_CONTROL_CODEC } from './media-playlist-tags/EXT-X-SERVER-CONTROL/schema';
import { EXT_X_PART_INF_CODEC } from './media-playlist-tags/EXT-X-PART-INF/schema';
import { EXT_X_PRELOAD_HINT_CODEC } from './media-playlist-tags/EXT-X-PRELOAD-HINT/schema';
import { EXT_X_SKIP_CODEC } from './media-playlist-tags/EXT-X-SKIP/schema';
import { EXT_X_RENDITION_REPORT_CODEC } from './media-playlist-tags/EXT-X-RENDITION-REPORT/schema';

// Multivariant playlist tags
import { EXT_X_I_FRAME_STREAM_INF_CODEC } from './multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/schema';
import { EXT_X_MEDIA_CODEC } from './multivariant-playlist-tags/EXT-X-MEDIA/schema';
import { EXT_X_SESSION_DATA_CODEC } from './multivariant-playlist-tags/EXT-X-SESSION-DATA/schema';
import { EXT_X_SESSION_KEY_CODEC } from './multivariant-playlist-tags/EXT-X-SESSION-KEY/schema';
import { EXT_X_STREAM_INF_CODEC } from './multivariant-playlist-tags/EXT-X-STREAM-INF/schema';
import { EXT_X_CONTENT_STEERING_CODEC } from './multivariant-playlist-tags/EXT-X-CONTENT-STEERING/schema';

// Media segment tags
import { EXT_X_BYTERANGE_CODEC } from './media-segment-tags/EXT-X-BYTERANGE/schema';
import { EXT_X_DATERANGE_CODEC } from './media-segment-tags/EXT-X-DATERANGE/schema';
import { EXT_X_DISCONTINUITY_CODEC } from './media-segment-tags/EXT-X-DISCONTINUITY/schema';
import { EXT_X_KEY_CODEC } from './media-segment-tags/EXT-X-KEY/schema';
import { EXT_X_MAP_CODEC } from './media-segment-tags/EXT-X-MAP/schema';
import { EXT_X_PROGRAM_DATE_TIME_CODEC } from './media-segment-tags/EXT-X-PROGRAM-DATE-TIME/schema';
import { EXT_X_GAP_CODEC } from './media-segment-tags/EXT-X-GAP/schema';
import { EXT_X_BITRATE_CODEC } from './media-segment-tags/EXT-X-BITRATE/schema';
import { EXT_X_PART_CODEC } from './media-segment-tags/EXT-X-PART/schema';
import { EXT_X_CUE_OUT_CODEC } from './media-segment-tags/EXT-X-CUE-OUT/schema';
import { EXT_X_CUE_IN_CODEC } from './media-segment-tags/EXT-X-CUE-IN/schema';
import { EXT_X_CUE_OUT_CONT_CODEC } from './media-segment-tags/EXT-X-CUE-OUT-CONT/schema';
import { EXT_X_ASSET_CODEC } from './media-segment-tags/EXT-X-ASSET/schema';
import { EXT_X_SPLICEPOINT_SCTE35_CODEC } from './media-segment-tags/EXT-X-SPLICEPOINT-SCTE35/schema';

export const playlistTagRegistry = {
    // Basic tags
    '#EXTM3U': EXTM3U_CODEC,
    '#EXT-X-VERSION': EXT_X_VERSION_CODEC,

    // Media or multivariant playlist tags
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS_CODEC,
    '#EXT-X-START': EXT_X_START_CODEC,
    '#EXT-X-DEFINE': EXT_X_DEFINE_CODEC,

    // Media playlist tags
    '#EXT-X-DISCONTINUITY-SEQUENCE': EXT_X_DISCONTINUITY_SEQUENCE_CODEC,
    '#EXT-X-ENDLIST': EXT_X_ENDLIST_CODEC,
    '#EXT-X-I-FRAMES-ONLY': EXT_X_I_FRAMES_ONLY_CODEC,
    '#EXT-X-MEDIA-SEQUENCE': EXT_X_MEDIA_SEQUENCE_CODEC,
    '#EXT-X-PLAYLIST-TYPE': EXT_X_PLAYLIST_TYPE_CODEC,
    '#EXT-X-TARGETDURATION': EXT_X_TARGETDURATION_CODEC,
    '#EXT-X-SERVER-CONTROL': EXT_X_SERVER_CONTROL_CODEC,
    '#EXT-X-PART-INF': EXT_X_PART_INF_CODEC,
    '#EXT-X-PRELOAD-HINT': EXT_X_PRELOAD_HINT_CODEC,
    '#EXT-X-SKIP': EXT_X_SKIP_CODEC,
    '#EXT-X-RENDITION-REPORT': EXT_X_RENDITION_REPORT_CODEC,

    // Multivariant playlist tags
    '#EXT-X-I-FRAME-STREAM-INF': EXT_X_I_FRAME_STREAM_INF_CODEC,
    '#EXT-X-MEDIA': EXT_X_MEDIA_CODEC,
    '#EXT-X-SESSION-DATA': EXT_X_SESSION_DATA_CODEC,
    '#EXT-X-SESSION-KEY': EXT_X_SESSION_KEY_CODEC,
    '#EXT-X-STREAM-INF': EXT_X_STREAM_INF_CODEC,
    '#EXT-X-CONTENT-STEERING': EXT_X_CONTENT_STEERING_CODEC,

    // Media segment tags
    '#EXT-X-BYTERANGE': EXT_X_BYTERANGE_CODEC,
    '#EXT-X-DATERANGE': EXT_X_DATERANGE_CODEC,
    '#EXT-X-DISCONTINUITY': EXT_X_DISCONTINUITY_CODEC,
    '#EXT-X-KEY': EXT_X_KEY_CODEC,
    '#EXT-X-MAP': EXT_X_MAP_CODEC,
    '#EXT-X-PROGRAM-DATE-TIME': EXT_X_PROGRAM_DATE_TIME_CODEC,
    '#EXT-X-GAP': EXT_X_GAP_CODEC,
    '#EXT-X-BITRATE': EXT_X_BITRATE_CODEC,
    '#EXT-X-PART': EXT_X_PART_CODEC,
    '#EXT-X-CUE-OUT': EXT_X_CUE_OUT_CODEC,
    '#EXT-X-CUE-IN': EXT_X_CUE_IN_CODEC,
    '#EXT-X-CUE-OUT-CONT': EXT_X_CUE_OUT_CONT_CODEC,
    '#EXT-X-ASSET': EXT_X_ASSET_CODEC,
    '#EXT-X-SPLICEPOINT-SCTE35': EXT_X_SPLICEPOINT_SCTE35_CODEC,
};
