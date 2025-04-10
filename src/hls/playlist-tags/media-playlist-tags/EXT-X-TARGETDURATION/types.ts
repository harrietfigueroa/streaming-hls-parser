/**
 * The EXT-X-TARGETDURATION tag specifies the maximum Media Segment
   duration.  The EXTINF duration of each Media Segment in the Playlist
   file, when rounded to the nearest integer, MUST be less than or equal
   to the target duration; longer segments can trigger playback stalls
   or other errors.  It applies to the entire Playlist file.  Its format
   is:

   #EXT-X-TARGETDURATION:<s>

   where s is a decimal-integer indicating the target duration in
   seconds.  The EXT-X-TARGETDURATION tag is REQUIRED.
 */
export type EXT_X_TARGETDURATION = `#EXT-X-TARGETDURATION:${number}`;
