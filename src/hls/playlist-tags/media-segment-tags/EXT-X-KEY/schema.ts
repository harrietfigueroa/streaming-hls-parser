import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-KEY' as const;
export const EXT_X_KEY_STRING = z.templateLiteral([TAG, ':', z.string()]);

export const EXT_X_KEY_METHOD = z.enum({
    NONE: 'NONE',
    AES_128: 'AES-128',
    SAMPLE_AES: 'SAMPLE-AES',
});

export const EXT_X_KEY_OBJECT = z.object({
    /**
     * METHOD

      The value is an enumerated-string that specifies the encryption
      method.  This attribute is REQUIRED.

      The methods defined are: NONE, AES-128, and SAMPLE-AES.

      An encryption method of NONE means that Media Segments are not
      encrypted.  If the encryption method is NONE, other attributes
      MUST NOT be present.

      An encryption method of AES-128 signals that Media Segments are
      completely encrypted using the Advanced Encryption Standard (AES)
      [AES_128] with a 128-bit key, Cipher Block Chaining (CBC), and
      Public-Key Cryptography Standards #7 (PKCS7) padding [RFC5652].
      CBC is restarted on each segment boundary, using either the
      Initialization Vector (IV) attribute value or the Media Sequence
      Number as the IV; see Section 5.2.

      An encryption method of SAMPLE-AES means that the Media Segments
      contain media samples, such as audio or video, that are encrypted
      using the Advanced Encryption Standard [AES_128].  How these media
      streams are encrypted and encapsulated in a segment depends on the

      media encoding and the media format of the segment.  fMP4 Media
      Segments are encrypted using the 'cbcs' scheme of Common
      Encryption [COMMON_ENC].  Encryption of other Media Segment
      formats containing H.264 [H_264], AAC [ISO_14496], AC-3 [AC_3],
      and Enhanced AC-3 [AC_3] media streams is described in the HTTP
      Live Streaming (HLS) Sample Encryption specification [SampleEnc].
      The IV attribute MAY be present; see Section 5.2.
     */
    METHOD: EXT_X_KEY_METHOD,

    /**
     * URI
      The value is a quoted-string containing a URI that specifies how
      to obtain the key.  This attribute is REQUIRED unless the METHOD
      is NONE.
     */
    URI: z.string().optional(),

    /** IV
     * The value is a hexadecimal-sequence that specifies a 128-bit
      unsigned integer Initialization Vector to be used with the key.
      Use of the IV attribute REQUIRES a compatibility version number of
      2 or greater.  See Section 5.2 for when the IV attribute is used.
     */
    IV: z.string().optional(),

    /**
     * KEYFORMAT
       The value is a quoted-string that specifies how the key is
      represented in the resource identified by the URI; see Section 5
      for more detail.  This attribute is OPTIONAL; its absence
      indicates an implicit value of "identity".  Use of the KEYFORMAT
      attribute REQUIRES a compatibility version number of 5 or greater.
     */
    KEYFORMAT: z.string().optional(),

    /**
     * KEYFORMATVERSIONS
       The value is a quoted-string containing one or more positive
      integers separated by the "/" character (for example, "1", "1/2",
      or "1/2/5").  If more than one version of a particular KEYFORMAT
      is defined, this attribute can be used to indicate which
      version(s) this instance complies with.  This attribute is
      OPTIONAL; if it is not present, its value is considered to be "1".
      Use of the KEYFORMATVERSIONS attribute REQUIRES a compatibility
      version number of 5 or greater.
     */
    KEYFORMATVERSIONS: z.string().optional(),
});

/**
4.3.2.4.  EXT-X-KEY

   Media Segments MAY be encrypted.  The EXT-X-KEY tag specifies how to
   decrypt them.  It applies to every Media Segment and to every Media
   Initialization Section declared by an EXT-X-MAP tag that appears
   between it and the next EXT-X-KEY tag in the Playlist file with the
   same KEYFORMAT attribute (or the end of the Playlist file).  Two or
   more EXT-X-KEY tags with different KEYFORMAT attributes MAY apply to
   the same Media Segment if they ultimately produce the same decryption
   key.  The format is:

   #EXT-X-KEY:<attribute-list>

   The following attributes are defined:

      METHOD

      The value is an enumerated-string that specifies the encryption
      method.  This attribute is REQUIRED.

      The methods defined are: NONE, AES-128, and SAMPLE-AES.

      An encryption method of NONE means that Media Segments are not
      encrypted.  If the encryption method is NONE, other attributes
      MUST NOT be present.

      An encryption method of AES-128 signals that Media Segments are
      completely encrypted using the Advanced Encryption Standard (AES)
      [AES_128] with a 128-bit key, Cipher Block Chaining (CBC), and
      Public-Key Cryptography Standards #7 (PKCS7) padding [RFC5652].
      CBC is restarted on each segment boundary, using either the
      Initialization Vector (IV) attribute value or the Media Sequence
      Number as the IV; see Section 5.2.

      An encryption method of SAMPLE-AES means that the Media Segments
      contain media samples, such as audio or video, that are encrypted
      using the Advanced Encryption Standard [AES_128].  How these media
      streams are encrypted and encapsulated in a segment depends on the

      media encoding and the media format of the segment.  fMP4 Media
      Segments are encrypted using the 'cbcs' scheme of Common
      Encryption [COMMON_ENC].  Encryption of other Media Segment
      formats containing H.264 [H_264], AAC [ISO_14496], AC-3 [AC_3],
      and Enhanced AC-3 [AC_3] media streams is described in the HTTP
      Live Streaming (HLS) Sample Encryption specification [SampleEnc].
      The IV attribute MAY be present; see Section 5.2.

      URI

      The value is a quoted-string containing a URI that specifies how
      to obtain the key.  This attribute is REQUIRED unless the METHOD
      is NONE.

      IV

      The value is a hexadecimal-sequence that specifies a 128-bit
      unsigned integer Initialization Vector to be used with the key.
      Use of the IV attribute REQUIRES a compatibility version number of
      2 or greater.  See Section 5.2 for when the IV attribute is used.

      KEYFORMAT

      The value is a quoted-string that specifies how the key is
      represented in the resource identified by the URI; see Section 5
      for more detail.  This attribute is OPTIONAL; its absence
      indicates an implicit value of "identity".  Use of the KEYFORMAT
      attribute REQUIRES a compatibility version number of 5 or greater.

      KEYFORMATVERSIONS

      The value is a quoted-string containing one or more positive
      integers separated by the "/" character (for example, "1", "1/2",
      or "1/2/5").  If more than one version of a particular KEYFORMAT
      is defined, this attribute can be used to indicate which
      version(s) this instance complies with.  This attribute is
      OPTIONAL; if it is not present, its value is considered to be "1".
      Use of the KEYFORMATVERSIONS attribute REQUIRES a compatibility
      version number of 5 or greater.

   If the Media Playlist file does not contain an EXT-X-KEY tag, then
   Media Segments are not encrypted.

   See Section 5 for the format of the Key file and Sections 5.2, 6.2.3,
   and 6.3.6 for additional information on Media Segment encryption.
 */
export const EXT_X_KEY_CODEC = z.codec(EXT_X_KEY_STRING, EXT_X_KEY_OBJECT, {
    decode: (value) => fromAttributeList(stripTag(value)),
    encode: (obj) => {
        const preEncoded: Record<string, unknown> = {
            ...obj,
        };

        if (obj['URI']) {
            preEncoded['URI'] = `"${obj['URI']}"`;
        }

        if (obj['KEYFORMAT']) {
            preEncoded['KEYFORMAT'] = `"${obj['KEYFORMAT']}"`;
        }

        if (obj['KEYFORMATVERSIONS']) {
            preEncoded['KEYFORMATVERSIONS'] = `"${obj['KEYFORMATVERSIONS']}"`;
        }

        return `${TAG}:${toAttributeList(preEncoded)}` as any;
    },
});
