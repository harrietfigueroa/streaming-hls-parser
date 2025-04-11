import { EXT_X_VERSION_STRING } from './playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U_STRING } from './playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_INDEPENDENT_SEGMENTS_STRING } from './playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import { EXT_X_START_STRING } from './playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import { EXT_X_ENDLIST_STRING } from './playlist-tags/media-playlist-tags/EXT-X-ENDLIST/types';
import { EXT_X_DISCONTINUITY_SEQUENCE_STRING } from './playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/types';
import { EXT_X_I_FRAMES_ONLY_STRING } from './playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/types';
import { EXT_X_MEDIA_SEQUENCE_STRING } from './playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/types';
import { EXT_X_PLAYLIST_TYPE_STRING } from './playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/types';
import { EXT_X_TARGETDURATION_STRING } from './playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/types';
import { EXT_X_BYTERANGE_STRING } from './playlist-tags/media-segment-tags/EXT-X-BYTERANGE/types';
import { EXT_X_DATERANGE_STRING } from './playlist-tags/media-segment-tags/EXT-X-DATERANGE/type';
import { EXT_X_DISCONTINUITY_STRING } from './playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/types';
import { EXT_X_KEY_STRING } from './playlist-tags/media-segment-tags/EXT-X-KEY/types';
import { EXT_X_MAP_STRING } from './playlist-tags/media-segment-tags/EXT-X-MAP/types';
import { EXT_X_PROGRAM_DATE_TIME_STRING } from './playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/types';
import { EXTINF_STRING } from './playlist-tags/media-segment-tags/EXTINF/types';
import { EXT_X_I_FRAME_STREAM_INF_STRING } from './playlist-tags/multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/types';
import { EXT_X_MEDIA_STRING } from './playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/types';
import { EXT_X_SESSION_DATA_STRING } from './playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/types';
import { EXT_X_SESSION_KEY_STRING } from './playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/types';
import { EXT_X_STREAM_INF_STRING } from './playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/types';

export type BASIC_TAGS = '#EXTM3U' | '#EXT-X-VERSION';

export type MEDIA_SEGMENT_TAGS =
    | '#EXTINF'
    | '#EXT-X-BYTERANGE'
    | '#EXT-X-DISCONTINUITY'
    | '#EXT-X-KEY'
    | '#EXT-X-MAP'
    | '#EXT-X-PROGRAM-DATE-TIME'
    | '#EXT-X-DATERANGE';

export type MEDIA_OR_MULTIVARIANT_TAGS =
    | BASIC_TAGS
    | ('#EXT-X-INDEPENDENT-SEGMENTS' | '#EXT-X-START');

export type MEDIA_PLAYLIST_TAGS =
    | MEDIA_OR_MULTIVARIANT_TAGS
    | (
          | '#EXT-X-TARGETDURATION'
          | '#EXT-X-MEDIA-SEQUENCE'
          | '#EXT-X-DISCONTINUITY-SEQUENCE'
          | '#EXT-X-ENDLIST'
          | '#EXT-X-PLAYLIST-TYPE'
          | '#EXT-X-I-FRAMES-ONLY'
      );

export type MULTIVARIANT_PLAYLIST_TAGS =
    | MEDIA_OR_MULTIVARIANT_TAGS
    | (
          | '#EXT-X-MEDIA'
          | '#EXT-X-STREAM-INF'
          | '#EXT-X-I-FRAME-STREAM-INF'
          | '#EXT-X-SESSION-DATA'
          | '#EXT-X-SESSION-KEY'
      );

export type PLAYLIST_TAGS =
    | BASIC_TAGS
    | MEDIA_SEGMENT_TAGS
    | MEDIA_PLAYLIST_TAGS
    | MULTIVARIANT_PLAYLIST_TAGS
    | MEDIA_OR_MULTIVARIANT_TAGS
    | 'URI';

export type PLAYLIST_TAGS_TO_STRING_TYPES = {
    '#EXTM3U': EXTM3U_STRING;
    '#EXT-X-VERSION': EXT_X_VERSION_STRING;
    '#EXTINF': EXTINF_STRING;
    '#EXT-X-BYTERANGE': EXT_X_BYTERANGE_STRING;
    '#EXT-X-DISCONTINUITY': EXT_X_DISCONTINUITY_STRING;
    '#EXT-X-KEY': EXT_X_KEY_STRING;
    '#EXT-X-MAP': EXT_X_MAP_STRING;
    '#EXT-X-PROGRAM-DATE-TIME': EXT_X_PROGRAM_DATE_TIME_STRING;
    '#EXT-X-DATERANGE': EXT_X_DATERANGE_STRING;
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS_STRING;
    '#EXT-X-START': EXT_X_START_STRING;
    '#EXT-X-TARGETDURATION': EXT_X_TARGETDURATION_STRING;
    '#EXT-X-MEDIA-SEQUENCE': EXT_X_MEDIA_SEQUENCE_STRING;
    '#EXT-X-DISCONTINUITY-SEQUENCE': EXT_X_DISCONTINUITY_SEQUENCE_STRING;
    '#EXT-X-ENDLIST': EXT_X_ENDLIST_STRING;
    '#EXT-X-PLAYLIST-TYPE': EXT_X_PLAYLIST_TYPE_STRING;
    '#EXT-X-I-FRAMES-ONLY': EXT_X_I_FRAMES_ONLY_STRING;
    '#EXT-X-MEDIA': EXT_X_MEDIA_STRING;
    '#EXT-X-STREAM-INF': EXT_X_STREAM_INF_STRING;
    '#EXT-X-I-FRAME-STREAM-INF': EXT_X_I_FRAME_STREAM_INF_STRING;
    '#EXT-X-SESSION-DATA': EXT_X_SESSION_DATA_STRING;
    '#EXT-X-SESSION-KEY': EXT_X_SESSION_KEY_STRING;
    URI: string; // URI always maps to a string
};
export type QuotedString = `"${string}"`;
