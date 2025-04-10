import { EXT_X_STREAM_INF_PARSED } from '../EXT-X-STREAM-INF/types';

/**
 * The EXT-X-I-FRAME-STREAM-INF tag identifies a Media Playlist file
   containing the I-frames of a multimedia presentation.  It stands
   alone, in that it does not apply to a particular URI in the Master
   Playlist.  Its format is:

   #EXT-X-I-FRAME-STREAM-INF:<attribute-list>

   All attributes defined for the EXT-X-STREAM-INF tag (Section 4.3.4.2)
   are also defined for the EXT-X-I-FRAME-STREAM-INF tag, except for the
   FRAME-RATE, AUDIO, SUBTITLES, and CLOSED-CAPTIONS attributes.  In
   addition, the following attribute is defined:

      URI

      The value is a quoted-string containing a URI that identifies the
      I-frame Media Playlist file.  That Playlist file MUST contain an
      EXT-X-I-FRAMES-ONLY tag.

   Every EXT-X-I-FRAME-STREAM-INF tag MUST include a BANDWIDTH attribute
   and a URI attribute.

   The provisions in Section 4.3.4.2.1 also apply to EXT-X-I-FRAME-
   STREAM-INF tags with a VIDEO attribute.

   A Master Playlist that specifies alternative VIDEO Renditions and
   I-frame Playlists SHOULD include an alternative I-frame VIDEO
   Rendition for each regular VIDEO Rendition, with the same NAME and
   LANGUAGE attributes.
 */
export interface EXT_I_FRAME_STREAM_PARSED
    extends Omit<
        EXT_X_STREAM_INF_PARSED,
        'FRAME-RATE' | 'AUDIO' | 'SUBTITLES' | 'CLOSED-CAPTIONS'
    > {
    /**
     * The value is a quoted-string containing a URI that identifies the
      I-frame Media Playlist file.  That Playlist file MUST contain an
      EXT-X-I-FRAMES-ONLY tag.
     */
    URI: string;
}

export type EXT_X_I_FRAME_STREAM_INF_STRING = `#EXT-X-I-FRAME-STREAM-INF:${string}`;
