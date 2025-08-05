import { QuotedString } from '../../../hls.types';
import { ValidationError } from '../../../validation-helpers/validator.types';

/**
 * The EXT-X-SESSION-DATA tag allows arbitrary session data to be
   carried in a Master Playlist.

   Its format is:

   #EXT-X-SESSION-DATA:<attribute-list>
 */
export interface EXT_X_SESSION_DATA_PARSED {
  /**
   * The value of DATA-ID is a quoted-string that identifies a
    particular data value.  The DATA-ID SHOULD conform to a reverse
    DNS naming convention, such as "com.example.movie.title"; however,
    there is no central registration authority, so Playlist authors
    SHOULD take care to choose a value that is unlikely to collide
    with others.  This attribute is REQUIRED.
   */
  'DATA-ID': string;

  /**
   * VALUE is a quoted-string.  It contains the data identified by
    DATA-ID.  If the LANGUAGE is specified, VALUE SHOULD contain a
    human-readable string written in the specified language.
   */
  VALUE: string;

  /**
   * The value is a quoted-string containing a URI.  The resource
    identified by the URI MUST be formatted as JSON [RFC7159];
    otherwise, clients may fail to interpret the resource.
   */
  URI: string;

  /**
   * The value is a quoted-string containing a language tag [RFC5646]
    that identifies the language of the VALUE.  This attribute is
    OPTIONAL.
   */
  LANGUAGE?: QuotedString;
}

export type EXT_X_SESSION_DATA_STRING = `#EXT-X-SESSION-DATA:${string}`;

// Generic parser type for type inference
type ExtXSessionDataParser<T extends string> = T extends EXT_X_SESSION_DATA_STRING ? EXT_X_SESSION_DATA_PARSED : never;

// Error interfaces
export interface ExtXSessionDataValidationError extends ValidationError {
  type: 'ExtXSessionDataDataIdRequiredError' | 'ExtXSessionDataValueOrUriRequiredError';
}

export interface ExtXSessionDataValidationResult {
  tagName: '#EXT-X-SESSION-DATA';
  errors: ExtXSessionDataValidationError[];
  isValid: boolean;
}

export type ExtXSessionDataValidationErrorUnion = ExtXSessionDataValidationError;

// Concrete error classes
export class ExtXSessionDataDataIdRequiredError extends Error implements ExtXSessionDataValidationError {
  readonly type = 'ExtXSessionDataDataIdRequiredError';
  readonly description = 'DATA-ID is required according to RFC 8216 Section 4.3.4.2.2';

  constructor(public readonly invalidValue: any) {
    super('DATA-ID is required');
    this.name = 'ExtXSessionDataDataIdRequiredError';
  }
}

export class ExtXSessionDataValueOrUriRequiredError extends Error implements ExtXSessionDataValidationError {
  readonly type = 'ExtXSessionDataValueOrUriRequiredError';
  readonly description = 'EXT-X-SESSION-DATA tag must contain either a VALUE or URI attribute, but not both according to RFC 8216 Section 4.3.4.2.2';

  constructor(public readonly invalidValue: any) {
    super('EXT-X-SESSION-DATA tag must contain either a VALUE or URI attribute, but not both');
    this.name = 'ExtXSessionDataValueOrUriRequiredError';
  }
}
