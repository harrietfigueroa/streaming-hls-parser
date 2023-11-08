/**
 *  The EXT-X-BYTERANGE tag indicates that a Media Segment is a sub-range
   of the resource identified by its URI.  It applies only to the next
   URI line that follows it in the Playlist.  Its format is:

   #EXT-X-BYTERANGE:<n>[@<o>]

   where n is a decimal-integer indicating the length of the sub-range
   in bytes.  If present, o is a decimal-integer indicating the start of
   the sub-range, as a byte offset from the beginning of the resource.
   If o is not present, the sub-range begins at the next byte following
   the sub-range of the previous Media Segment.

   If o is not present, a previous Media Segment MUST appear in the
   Playlist file and MUST be a sub-range of the same media resource, or
   the Media Segment is undefined and the client MUST fail to parse the
   Playlist.

   A Media Segment without an EXT-X-BYTERANGE tag consists of the entire
   resource identified by its URI.

   Use of the EXT-X-BYTERANGE tag REQUIRES a compatibility version
   number of 4 or greater.
 */
export type ByteRange = `#EXT-X-BYTERANGE:${number}${'' | `@${number}`}`;
