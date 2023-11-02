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

export type QuotedString = `"${string}"`;
