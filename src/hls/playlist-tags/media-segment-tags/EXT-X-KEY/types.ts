import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

/**
 * The EXT-X-KEY tag specifies how to decrypt Media Segments that are
   encrypted.  It applies to every Media Segment that appears between it
   and the next EXT-X-KEY tag (if any) with the same METHOD attribute
   (or until the end of the Playlist).  Its format is:

   #EXT-X-KEY:METHOD=<method>[,URI="<uri>"][,IV=<iv>][,KEYFORMAT="<keyformat>"][,KEYFORMATVERSIONS="<keyformatversions>"]

   where method is an enumerated-string; uri is a quoted-string; iv is
   a hexadecimal-sequence; keyformat is a quoted-string; and
   keyformatversions is a quoted-string containing one or more positive
   integers separated by the "/" character.
 */
export const EXT_X_KEY_METHOD = {
    /**
     * An encryption method of NONE means that Media Segments are not
      encrypted.  If the encryption method is NONE, other attributes
      MUST NOT be present.
     */
    NONE: 'NONE',
    /**
     * An encryption method of AES-128 signals that Media Segments are
      completely encrypted using the Advanced Encryption Standard (AES)
      [AES_128] with a 128-bit key, Cipher Block Chaining (CBC), and
      Public-Key Cryptography Standards #7 (PKCS7) padding [RFC5652].
      CBC is restarted on each segment boundary, using either the
      Initialization Vector (IV) attribute value or the Media Sequence
      Number as the IV; see Section 5.2.
     */
    'AES-128': 'AES-128',
    /**
     * An encryption method of SAMPLE-AES means that the Media Segments
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
    'SAMPLE-AES': 'SAMPLE-AES',
} as const;

export type EXT_X_KEY_METHOD_VALUES = (typeof EXT_X_KEY_METHOD)[keyof typeof EXT_X_KEY_METHOD];

export interface EXT_X_KEY_PARSED {
    METHOD: EXT_X_KEY_METHOD_VALUES;
    URI?: string;
    IV?: string;
    KEYFORMAT?: string;
    KEYFORMATVERSIONS?: string;
}

export type EXT_X_KEY_STRING = `#EXT-X-KEY:${string}`;

// Abstract validation error class for this tag
export abstract class ExtXKeyValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-KEY';
}

// Concrete validation error classes
export class ExtXKeyNotAnObjectError extends ExtXKeyValidationError {
    readonly type: ValidationErrorType = 'not-an-object';
    readonly tagName = '#EXT-X-KEY';
    readonly description = 'EXT-X-KEY value must be an object (RFC 8216 Section 4.3.2.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXKeyMissingMethodError extends ExtXKeyValidationError {
    readonly type: ValidationErrorType = 'missing-method';
    readonly tagName = '#EXT-X-KEY';
    readonly description = 'EXT-X-KEY object must have a METHOD property (RFC 8216 Section 4.3.2.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXKeyInvalidMethodError extends ExtXKeyValidationError {
    readonly type: ValidationErrorType = 'invalid-method';
    readonly tagName = '#EXT-X-KEY';
    readonly description = 'EXT-X-KEY METHOD must be one of: NONE, AES-128, SAMPLE-AES (RFC 8216 Section 4.3.2.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXKeyNoneWithAttributesError extends ExtXKeyValidationError {
    readonly type: ValidationErrorType = 'none-with-attributes';
    readonly tagName = '#EXT-X-KEY';
    readonly description = 'EXT-X-KEY: When METHOD is NONE, no other attributes should be present (RFC 8216 Section 4.3.2.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXKeyMissingUriError extends ExtXKeyValidationError {
    readonly type: ValidationErrorType = 'missing-uri';
    readonly tagName = '#EXT-X-KEY';
    readonly description = 'EXT-X-KEY: URI is required when METHOD is not NONE (RFC 8216 Section 4.3.2.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtXKeyValidationErrorUnion =
    | ExtXKeyNotAnObjectError
    | ExtXKeyMissingMethodError
    | ExtXKeyInvalidMethodError
    | ExtXKeyNoneWithAttributesError
    | ExtXKeyMissingUriError; 