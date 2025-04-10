/**
 * The EXT-X-DISCONTINUITY-SEQUENCE tag allows synchronization between
   different Renditions of the same Variant Stream or different Variant
   Streams that have EXT-X-DISCONTINUITY tags in their Media Playlists.

   Its format is:

   #EXT-X-DISCONTINUITY-SEQUENCE:<number>

   where number is a decimal-integer.

   If the Media Playlist does not contain an EXT-X-DISCONTINUITY-
   SEQUENCE tag, then the Discontinuity Sequence Number of the first
   Media Segment in the Playlist SHALL be considered to be 0.

   The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first
   Media Segment in the Playlist.

   The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-
   X-DISCONTINUITY tag.

   See Sections 6.2.1 and 6.2.2 for more information about setting the
   value of the EXT-X-DISCONTINUITY-SEQUENCE tag.
 */
export type EXT_X_DISCONTINUITY_SEQUENCE_PARSED = number;
export type EXT_X_DISCONTINUITY_SEQUENCE_STRING = `#EXT-X-DISCONTINUITY-SEQUENCE:${number}`;
