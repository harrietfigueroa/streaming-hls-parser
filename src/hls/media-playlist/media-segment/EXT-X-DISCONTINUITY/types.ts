/**
 * The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
   Media Segment that follows it and the one that preceded it.

   Its format is:

   #EXT-X-DISCONTINUITY

   The EXT-X-DISCONTINUITY tag MUST be present if there is a change in
   any of the following characteristics:

   o  file format

   o  number, type, and identifiers of tracks

   o  timestamp sequence

   The EXT-X-DISCONTINUITY tag SHOULD be present if there is a change in
   any of the following characteristics:

   o  encoding parameters

   o  encoding sequence

   See Sections 3, 6.2.1, and 6.3.3 for more information about the EXT-
   X-DISCONTINUITY tag.
 */
export type Discontinuity = '#EXT-X-DISCONTINUITY';
