/**
 * The EXTINF tag specifies the duration of a Media Segment.  It applies
   only to the next Media Segment.  This tag is REQUIRED for each Media
   Segment.  Its format is:

   #EXTINF:<duration>,[<title>]

   where duration is a decimal-floating-point or decimal-integer number
   (as described in Section 4.2) that specifies the duration of the
   Media Segment in seconds.  Durations SHOULD be decimal-floating-
   point, with enough accuracy to avoid perceptible error when segment
   durations are accumulated.  However, if the compatibility version
   number is less than 3, durations MUST be integers.  Durations that
   are reported as integers SHOULD be rounded to the nearest integer.
   The remainder of the line following the comma is an optional human-
   readable informative title of the Media Segment expressed as UTF-8
   text.
 */

export type EXTINF = `#EXTINF:${number},${string}` | `#EXTINF:${number}`;
