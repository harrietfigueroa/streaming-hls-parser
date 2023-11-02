import { MEDIA_PLAYLIST_TAGS, MEDIA_SEGMENT_TAGS, MULTIVARIANT_PLAYLIST_TAGS } from './hls.types';

export const TAG_TO_SYMBOL: Record<
    MEDIA_SEGMENT_TAGS | MEDIA_PLAYLIST_TAGS | MULTIVARIANT_PLAYLIST_TAGS,
    symbol
> = {
    // Basic
    '#EXTM3U': Symbol(),
    '#EXT-X-VERSION': Symbol(),
    // Media Segment
    '#EXTINF': Symbol(),
    '#EXT-X-BYTERANGE': Symbol(),
    '#EXT-X-DISCONTINUITY': Symbol(),
    '#EXT-X-KEY': Symbol(),
    '#EXT-X-MAP': Symbol(),
    '#EXT-X-PROGRAM-DATE-TIME': Symbol(),
    '#EXT-X-DATERANGE': Symbol(),
    // Media or Multivariat
    '#EXT-X-INDEPENDENT-SEGMENTS': Symbol(),
    '#EXT-X-START': Symbol(),
    // Media Playlist
    '#EXT-X-TARGETDURATION': Symbol(),
    '#EXT-X-MEDIA-SEQUENCE': Symbol(),
    '#EXT-X-DISCONTINUITY-SEQUENCE': Symbol(),
    '#EXT-X-ENDLIST': Symbol(),
    '#EXT-X-PLAYLIST-TYPE': Symbol(),
    '#EXT-X-I-FRAMES-ONLY': Symbol(),
    // Multivariant
    '#EXT-X-MEDIA': Symbol(),
    '#EXT-X-STREAM-INF': Symbol(),
    '#EXT-X-I-FRAME-STREAM-INF': Symbol(),
    '#EXT-X-SESSION-DATA': Symbol(),
    '#EXT-X-SESSION-KEY': Symbol(),
} as const;

export const URI = Symbol();
