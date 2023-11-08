/**
 * The EXT-X-I-FRAMES-ONLY tag indicates that each Media Segment in the
   Playlist describes a single I-frame.  I-frames are encoded video
   frames whose encoding does not depend on any other frame.  I-frame
   Playlists can be used for trick play, such as fast forward, rapid
   reverse, and scrubbing.

   The EXT-X-I-FRAMES-ONLY tag applies to the entire Playlist.  Its
   format is:

   #EXT-X-I-FRAMES-ONLY

   In a Playlist with the EXT-X-I-FRAMES-ONLY tag, the Media Segment
   duration (EXTINF tag value) is the time between the presentation time
   of the I-frame in the Media Segment and the presentation time of the
   next I-frame in the Playlist, or the end of the presentation if it is
   the last I-frame in the Playlist.

   Media resources containing I-frame segments MUST begin with either a
   Media Initialization Section (Section 3) or be accompanied by an EXT-
   X-MAP tag indicating the Media Initialization Section so that clients
   can load and decode I-frame segments in any order.  The byte range of
   an I-frame segment with an EXT-X-BYTERANGE tag applied to it
   (Section 4.3.2.2) MUST NOT include its Media Initialization Section;
 */
export type IFramesOnly = '#EXT-X-I-FRAMES-ONLY';
