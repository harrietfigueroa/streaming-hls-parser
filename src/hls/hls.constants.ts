import { MEDIA_PLAYLIST_TAGS, MEDIA_SEGMENT_TAGS, MULTIVARIANT_PLAYLIST_TAGS } from './hls.types';
import { EXT_X_VERSION } from './playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U } from './playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_ENDLIST } from './playlist-tags/media-playlist-tags/EXT-ENDLIST/types';
import { EXT_X_I_FRAMES_ONLY } from './playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/types';
import { EXT_X_KEY } from './playlist-tags/media-segment-tags/EXT-X-KEY/types';
import { EXT_X_MAP } from './playlist-tags/media-segment-tags/EXT-X-MAP/types';
import { EXT_X_MEDIA_SEQUENCE } from './playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/types';
import { EXT_X_PLAYLIST_TYPE } from './playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/types';
import { EXT_X_TARGETDURATION } from './playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/types';
import { EXT_X_BYTERANGE } from './playlist-tags/media-segment-tags/EXT-X-BYTERANGE/types';
import { EXT_X_DATERANGE } from './playlist-tags/media-segment-tags/EXT-X-DATERANGE/type';
import { EXT_X_DISCONTINUITY } from './playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/types';
import { EXTINF } from './playlist-tags/media-segment-tags/EXTINF/types';

export const HLS_TAG_TYPES: Record<
    MEDIA_SEGMENT_TAGS | MEDIA_PLAYLIST_TAGS | MULTIVARIANT_PLAYLIST_TAGS,
    symbol
> = {
    // Basic
    '#EXTM3U': Symbol('EXTM3U'),
    '#EXT-X-VERSION': Symbol('EXT-X-VERSION'),
    // Media Segment
    '#EXTINF': Symbol('EXTINF'),
    '#EXT-X-BYTERANGE': Symbol('EXT-X-BYTERANGE'),
    '#EXT-X-DISCONTINUITY': Symbol('EXT-X-DISCONTINUITY'),
    '#EXT-X-KEY': Symbol('EXT-X-KEY'),
    '#EXT-X-MAP': Symbol('EXT-X-MAP'),
    '#EXT-X-PROGRAM-DATE-TIME': Symbol('EXT-X-PROGRAM-DATE-TIME'),
    '#EXT-X-DATERANGE': Symbol('EXT-X-DATERANGE'),
    // Media Playlist or Multivariant Playlist
    '#EXT-X-INDEPENDENT-SEGMENTS': Symbol('EXT-X-INDEPENDENT-SEGMENTS'),
    '#EXT-X-START': Symbol('EXT-X-START'),
    // Media Playlist
    '#EXT-X-TARGETDURATION': Symbol('EXT-X-TARGETDURATION'),
    '#EXT-X-MEDIA-SEQUENCE': Symbol('EXT-X-MEDIA-SEQUENCE'),
    '#EXT-X-DISCONTINUITY-SEQUENCE': Symbol('EXT-X-DISCONTINUITY-SEQUENCE'),
    '#EXT-X-ENDLIST': Symbol('EXT-X-ENDLIST'),
    '#EXT-X-PLAYLIST-TYPE': Symbol('EXT-X-PLAYLIST-TYPE'),
    '#EXT-X-I-FRAMES-ONLY': Symbol('EXT-X-I-FRAMES-ONLY'),
    // Multivariant Playlist
    '#EXT-X-MEDIA': Symbol('EXT-X-MEDIA'),
    '#EXT-X-STREAM-INF': Symbol('EXT-X-STREAM-INF'),
    '#EXT-X-I-FRAME-STREAM-INF': Symbol('EXT-X-I-FRAME-STREAM-INF'),
    '#EXT-X-SESSION-DATA': Symbol('EXT-X-SESSION-DATA'),
    '#EXT-X-SESSION-KEY': Symbol('EXT-X-SESSION-KEY'),
} as const;

export type HLS_TAG_TYPES_TO_SOURCE_VALUE =
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXTM3U']]: EXTM3U;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-VERSION']]: EXT_X_VERSION;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXTINF']]: EXTINF;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-BYTERANGE']]: EXT_X_BYTERANGE;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-DISCONTINUITY']]: EXT_X_DISCONTINUITY;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-KEY']]: EXT_X_KEY;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-MAP']]: EXT_X_MAP;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-PROGRAM-DATE-TIME']]: EXT_X_PROGRAM_DATE_TIME;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-DATERANGE']]: EXT_X_DATERANGE;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-INDEPENDENT-SEGMENTS']]: EXT_X_INDEPENDENT_SEGMENTS;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-START']]: EXT_X_START;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-TARGETDURATION']]: EXT_X_TARGETDURATION;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-MEDIA-SEQUENCE']]: EXT_X_MEDIA_SEQUENCE;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-DISCONTINUITY-SEQUENCE']]: EXT_X_DISCONTINUITY;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-ENDLIST']]: EXT_X_ENDLIST;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-PLAYLIST-TYPE']]: EXT_X_PLAYLIST_TYPE;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-I-FRAMES-ONLY']]: EXT_X_I_FRAMES_ONLY;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-MEDIA']]: EXT_X_MEDIA;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-STREAM-INF']]: EXT_X_STREAM_INF;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-I-FRAME-STREAM-INF']]: EXT_X_I_FRAME_STREAM_INF;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-SESSION-DATA']]: EXT_X_SESSION_DATA;
      }
    | {
          [key in (typeof HLS_TAG_TYPES)['#EXT-X-SESSION-KEY']]: EXT_X_SESSION_KEY;
      };
export const URI = Symbol('URI');
