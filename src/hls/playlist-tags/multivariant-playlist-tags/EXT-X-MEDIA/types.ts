import { QuotedString } from '../../../hls.types';

/**
 * The EXT-X-MEDIA tag is used to relate Media Playlists that contain
   alternative Renditions (Section 4.3.4.2.1) of the same content.  For
   example, three EXT-X-MEDIA tags can be used to identify audio-only
   Media Playlists that contain English, French, and Spanish Renditions
   of the same presentation.  Or, two EXT-X-MEDIA tags can be used to
   identify video-only Media Playlists that show two different camera
   angles.

   Its format is:

   #EXT-X-MEDIA:<attribute-list>
 */
export interface EXT_X_MEDIA_PARSED {
    /**
     * The value is an enumerated-string; valid strings are AUDIO, VIDEO,
      SUBTITLES, and CLOSED-CAPTIONS.  This attribute is REQUIRED.

      Typically, closed-caption [CEA608] media is carried in the video
      stream.  Therefore, an EXT-X-MEDIA tag with TYPE of CLOSED-
      CAPTIONS does not specify a Rendition; the closed-caption media is
      present in the Media Segments of every video Rendition
     */
    TYPE: 'AUDIO' | 'VIDEO' | 'SUBTITLES' | 'CLOSED-CAPTIONS';

    /**
     * The value is a quoted-string containing a URI that identifies the
      Media Playlist file.  This attribute is OPTIONAL; see
      Section 4.3.4.2.1.  If the TYPE is CLOSED-CAPTIONS, the URI
      attribute MUST NOT be present.
     */
    URI?: string;

    /**
     * The value is a quoted-string that specifies the group to which the
      Rendition belongs.  See Section 4.3.4.1.1.  This attribute is
      REQUIRED.
     */
    'GROUP-ID': QuotedString;

    /**
     * The value is a quoted-string containing one of the standard Tags
      for Identifying Languages [RFC5646], which identifies the primary
      language used in the Rendition.  This attribute is OPTIONAL.
    */
    LANGUAGE?: QuotedString;

    /**
     * The value is a quoted-string containing a language tag [RFC5646]
      that identifies a language that is associated with the Rendition.
      An associated language is often used in a different role than the
      language specified by the LANGUAGE attribute (e.g., written versus
      spoken or a fallback dialect).  This attribute is OPTIONAL.

      The LANGUAGE and ASSOC-LANGUAGE attributes can be used, for
      example, to link Norwegian Renditions that use different spoken
      and written languages.
     */
    'ASSOC-LANGUAGE'?: string;

    /**
     * The value is a quoted-string containing a human-readable
      description of the Rendition.  If the LANGUAGE attribute is
      present, then this description SHOULD be in that language.  This
      attribute is REQUIRED.
     */
    NAME: QuotedString;

    /**
     * The value is an enumerated-string; valid strings are YES and NO.
      If the value is YES, then the client SHOULD play this Rendition of
      the content in the absence of information from the user indicating
      a different choice.  This attribute is OPTIONAL.  Its absence
      indicates an implicit value of NO.
     */
    DEFAULT?: 'YES' | 'NO';

    /**
     * The value is an enumerated-string; valid strings are YES and NO.
      This attribute is OPTIONAL.  Its absence indicates an implicit
      value of NO.  If the value is YES, then the client MAY choose to
      play this Rendition in the absence of explicit user preference
      because it matches the current playback environment, such as
      chosen system language.

      If the AUTOSELECT attribute is present, its value MUST be YES if
      the value of the DEFAULT attribute is YES.
     */
    AUTOSELECT?: 'YES' | 'NO';

    /**
     * The value is an enumerated-string; valid strings are YES and NO.
      This attribute is OPTIONAL.  Its absence indicates an implicit
      value of NO.  The FORCED attribute MUST NOT be present unless the
      TYPE is SUBTITLES.

      A value of YES indicates that the Rendition contains content that
      is considered essential to play.  When selecting a FORCED
      Rendition, a client SHOULD choose the one that best matches the
      current playback environment (e.g., language).

      A value of NO indicates that the Rendition contains content that
      is intended to be played in response to explicit user request.
     */
    FORCED?: 'YES' | 'NO';

    /**
     * The value is a quoted-string that specifies a Rendition within the
      segments in the Media Playlist.  This attribute is REQUIRED if the
      TYPE attribute is CLOSED-CAPTIONS, in which case it MUST have one
      of the values: "CC1", "CC2", "CC3", "CC4", or "SERVICEn" where n
      MUST be an integer between 1 and 63 (e.g., "SERVICE3" or
      "SERVICE42").

      The values "CC1", "CC2", "CC3", and "CC4" identify a Line 21 Data
      Services channel [CEA608].  The "SERVICE" values identify a
      Digital Television Closed Captioning [CEA708] service block
      number.
     */
    'INSTREAM-ID': '"CC1"' | '"CC2"' | '"CC3"' | '"CC4"' | `"SERVICE${number}"`;

    /**
     * The value is a quoted-string containing one or more Uniform Type
      Identifiers [UTI] separated by comma (,) characters.  This
      attribute is OPTIONAL.  Each UTI indicates an individual
      characteristic of the Rendition.

      A SUBTITLES Rendition MAY include the following characteristics:
      "public.accessibility.transcribes-spoken-dialog",
      "public.accessibility.describes-music-and-sound", and
      "public.easy-to-read" (which indicates that the subtitles have
      been edited for ease of reading).

      An AUDIO Rendition MAY include the following characteristic:
      "public.accessibility.describes-video".

      The CHARACTERISTICS attribute MAY include private UTIs.
     */
    CHARACTERISTICS: QuotedString;

    /**
     * The value is a quoted-string that specifies an ordered, backslash-
      separated ("/") list of parameters.  If the TYPE attribute is
      AUDIO, then the first parameter is a count of audio channels
      expressed as a decimal-integer, indicating the maximum number of
      independent, simultaneous audio channels present in any Media
      Segment in the Rendition.  For example, an AC-3 5.1 Rendition
      would have a CHANNELS="6" attribute.  No other CHANNELS parameters
      are currently defined.

      All audio EXT-X-MEDIA tags SHOULD have a CHANNELS attribute.  If a
      Master Playlist contains two Renditions encoded with the same
      codec but a different number of channels, then the CHANNELS
      attribute is REQUIRED; otherwise, it is OPTIONAL.
     */
    CHANNELS: QuotedString;
}

export type EXT_X_MEDIA_STRING = `#EXT-X-MEDIA:${string}`;
