/**
 * The EXT-X-MEDIA-SEQUENCE tag indicates the Media Sequence Number of
   the first Media Segment that appears in a Playlist file.  Its format
   is:

   #EXT-X-MEDIA-SEQUENCE:<number>

   where number is a decimal-integer.

   If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE
   tag, then the Media Sequence Number of the first Media Segment in the
   Media Playlist SHALL be considered to be 0.  A client MUST NOT assume
   that segments with the same Media Sequence Number in different Media
   Playlists contain matching content (see Section 6.3.2).
 */
export type MediaSequence = `#EXT-X-MEDIA-SEQUENCE:${number}`;
