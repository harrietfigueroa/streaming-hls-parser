import { EXT_X_VERSION } from './playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U } from './playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_INDEPENDENT_SEGMENTS } from './playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import { EXT_X_START } from './playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import { EXT_X_ENDLIST } from './playlist-tags/media-playlist-tags/EXT-ENDLIST/types';
import { EXT_X_DISCONTINUITY_SEQUENCE } from './playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/types';
import { EXT_X_I_FRAMES_ONLY } from './playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/types';
import { EXT_X_MEDIA_SEQUENCE } from './playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/types';
import { EXT_X_PLAYLIST_TYPE } from './playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/types';
import { EXT_X_TARGETDURATION } from './playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/types';
import { EXT_X_BYTERANGE } from './playlist-tags/media-segment-tags/EXT-X-BYTERANGE/types';
import { EXT_X_DATERANGE } from './playlist-tags/media-segment-tags/EXT-X-DATERANGE/type';
import { EXT_X_DISCONTINUITY } from './playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/types';
import { EXT_X_KEY } from './playlist-tags/media-segment-tags/EXT-X-KEY/types';
import { EXT_X_MAP } from './playlist-tags/media-segment-tags/EXT-X-MAP/types';
import { EXT_X_PROGRAM_DATE_TIME } from './playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/parser';
import { EXTINF } from './playlist-tags/media-segment-tags/EXTINF/types';
import { EXT_X_I_FRAME_STREAM_INF } from './playlist-tags/multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/types';
import { EXT_X_MEDIA } from './playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/types';
import { EXT_X_SESSION_DATA } from './playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/types';
import { EXT_X_SESSION_KEY } from './playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/types';
import { EXT_X_STREAM_INF } from './playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/types';

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

export type PLAYLIST_TAGS_TO_TYPES = {
    '#EXTM3U': EXTM3U;
    '#EXT-X-VERSION': EXT_X_VERSION;
    '#EXTINF': EXTINF;
    '#EXT-X-BYTERANGE': EXT_X_BYTERANGE;
    '#EXT-X-DISCONTINUITY': EXT_X_DISCONTINUITY;
    '#EXT-X-KEY': EXT_X_KEY;
    '#EXT-X-MAP': EXT_X_MAP;
    '#EXT-X-PROGRAM-DATE-TIME': EXT_X_PROGRAM_DATE_TIME;
    '#EXT-X-DATERANGE': EXT_X_DATERANGE;
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS;
    '#EXT-X-START': EXT_X_START;
    '#EXT-X-TARGETDURATION': EXT_X_TARGETDURATION;
    '#EXT-X-MEDIA-SEQUENCE': EXT_X_MEDIA_SEQUENCE;
    '#EXT-X-DISCONTINUITY-SEQUENCE': EXT_X_DISCONTINUITY_SEQUENCE;
    '#EXT-X-ENDLIST': EXT_X_ENDLIST;
    '#EXT-X-PLAYLIST-TYPE': EXT_X_PLAYLIST_TYPE;
    '#EXT-X-I-FRAMES-ONLY': EXT_X_I_FRAMES_ONLY;
    '#EXT-X-MEDIA': EXT_X_MEDIA;
    '#EXT-X-STREAM-INF': EXT_X_STREAM_INF;
    '#EXT-X-I-FRAME-STREAM-INF': EXT_X_I_FRAME_STREAM_INF;
    '#EXT-X-SESSION-DATA': EXT_X_SESSION_DATA;
    '#EXT-X-SESSION-KEY': EXT_X_SESSION_KEY;
    URI: string; // URI always maps to a string
};
export type QuotedString = `"${string}"`;
