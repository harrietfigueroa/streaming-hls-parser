import { QuotedString } from '../../../hls.types';

/**
 * The EXT-X-STREAM-INF tag specifies a Variant Stream, which is a set
   of Renditions that can be combined to play the presentation.  The
   attributes of the tag provide information about the Variant Stream.

   The URI line that follows the EXT-X-STREAM-INF tag specifies a Media
   Playlist that carries a Rendition of the Variant Stream.  The URI
   line is REQUIRED.  Clients that do not support multiple video
   Renditions SHOULD play this Rendition.

   Its format is:

   #EXT-X-STREAM-INF:<attribute-list>
   <URI>
 */
export interface EXT_X_STREAM_INF_PARSED {
    /**
     * The value is a decimal-integer of bits per second.  It represents
      the peak segment bit rate of the Variant Stream.

      If all the Media Segments in a Variant Stream have already been
      created, the BANDWIDTH value MUST be the largest sum of peak
      segment bit rates that is produced by any playable combination of
      Renditions.  (For a Variant Stream with a single Media Playlist,
      this is just the peak segment bit rate of that Media Playlist.)
      An inaccurate value can cause playback stalls or prevent clients
      from playing the variant.

      If the Master Playlist is to be made available before all Media
      Segments in the presentation have been encoded, the BANDWIDTH
      value SHOULD be the BANDWIDTH value of a representative period of
      similar content, encoded using the same settings.

      Every EXT-X-STREAM-INF tag MUST include the BANDWIDTH attribute.
     */
    BANDWIDTH: number;

    /**
     * The value is a decimal-integer of bits per second.  It represents
      the average segment bit rate of the Variant Stream.

      If all the Media Segments in a Variant Stream have already been
      created, the AVERAGE-BANDWIDTH value MUST be the largest sum of
      average segment bit rates that is produced by any playable
      combination of Renditions.  (For a Variant Stream with a single
      Media Playlist, this is just the average segment bit rate of that
      Media Playlist.)  An inaccurate value can cause playback stalls or
      prevent clients from playing the variant.

      If the Master Playlist is to be made available before all Media
      Segments in the presentation have been encoded, the AVERAGE-
      BANDWIDTH value SHOULD be the AVERAGE-BANDWIDTH value of a
      representative period of similar content, encoded using the same
      settings.

      The AVERAGE-BANDWIDTH attribute is OPTIONAL.
     */
    'AVERAGE-BANDWIDTH'?: number;

    /**
     * The value is a quoted-string containing a comma-separated list of
      formats, where each format specifies a media sample type that is
      present in one or more Renditions specified by the Variant Stream.
      Valid format identifiers are those in the ISO Base Media File
      Format Name Space defined by "The 'Codecs' and 'Profiles'
      Parameters for "Bucket" Media Types" [RFC6381].

      For example, a stream containing AAC low complexity (AAC-LC) audio
      and H.264 Main Profile Level 3.0 video would have a CODECS value
      of "mp4a.40.2,avc1.4d401e".

      Every EXT-X-STREAM-INF tag SHOULD include a CODECS attribute.
     */
    CODECS: QuotedString[];

    /**
     * The value is a decimal-resolution describing the optimal pixel
      resolution at which to display all the video in the Variant
      Stream.

      The RESOLUTION attribute is OPTIONAL but is recommended if the
      Variant Stream includes video.
     */
    RESOLUTION?: number;

    /**
     * The value is a decimal-floating-point describing the maximum frame
      rate for all the video in the Variant Stream, rounded to three
      decimal places.

      The FRAME-RATE attribute is OPTIONAL but is recommended if the
      Variant Stream includes video.  The FRAME-RATE attribute SHOULD be
      included if any video in a Variant Stream exceeds 30 frames per
      second.
     */
    'FRAME-RATE'?: number;

    /**
     * The value is an enumerated-string; valid strings are TYPE-0 and
      NONE.  This attribute is advisory; a value of TYPE-0 indicates
      that the Variant Stream could fail to play unless the output is
      protected by High-bandwidth Digital Content Protection (HDCP) Type
      0 [HDCP] or equivalent.  A value of NONE indicates that the
      content does not require output copy protection.

      Encrypted Variant Streams with different HDCP levels SHOULD use
      different media encryption keys.
     */
    'HDCP-LEVEL': 'TYPE-0' | 'NONE';

    /**
     * The value is a quoted-string.  It MUST match the value of the
      GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
      Playlist whose TYPE attribute is AUDIO.  It indicates the set of
      audio Renditions that SHOULD be used when playing the
      presentation.  See Section 4.3.4.2.1.

      The AUDIO attribute is OPTIONAL.
     */
    AUDIO?: QuotedString;

    /**
     * The value is a quoted-string.  It MUST match the value of the
      GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
      Playlist whose TYPE attribute is VIDEO.  It indicates the set of
      video Renditions that SHOULD be used when playing the
      presentation.  See Section 4.3.4.2.1.

      The VIDEO attribute is OPTIONAL.
     */
    VIDEO?: QuotedString;
}

export type EXT_X_STREAM_INF_VALUES = keyof EXT_X_STREAM_INF_PARSED;
export type EXT_X_STREAM_INF_STRING = `#EXT-X-STREAM-INF:${string}`;
