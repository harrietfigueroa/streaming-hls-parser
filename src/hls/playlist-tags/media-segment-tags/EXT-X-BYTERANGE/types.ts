import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

export type EXT_X_BYTE_RANGE_STRING_VALUE = `${number}${'' | `@${number}`}`;
export type EXT_X_BYTERANGE_SINGLE_PARAM = number;
export type EXT_X_BYTERANGE_DOUBLE_PARAM = [number, number];

/**
 *  The EXT-X-BYTERANGE tag indicates that a Media Segment is a sub-range
   of the resource identified by its URI.  It applies only to the next
   URI line that follows it in the Playlist.  Its format is:

   #EXT-X-BYTERANGE:<n>[@<o>]

   where n is a decimal-integer indicating the length of the sub-range
   in bytes.  If present, o is a decimal-integer indicating the start of
   the sub-range, as a byte offset from the beginning of the resource.
   If o is not present, the sub-range begins at the next byte following
   the sub-range of the previous Media Segment.

   If o is not present, a previous Media Segment MUST appear in the
   Playlist file and MUST be a sub-range of the same media resource, or
   the Media Segment is undefined and the client MUST fail to parse the
   Playlist.

   A Media Segment without an EXT-X-BYTERANGE tag consists of the entire
   resource identified by its URI.

   Use of the EXT-X-BYTERANGE tag REQUIRES a compatibility version
   number of 4 or greater.
 */
export interface EXT_X_BYTERANGE_PARSED<T = EXT_X_BYTERANGE_STRING> {
  LENGTH: number;
  OFFSET?: number;
}

export type EXT_X_BYTERANGE_STRING = `#EXT-X-BYTERANGE:${EXT_X_BYTE_RANGE_STRING_VALUE}`;

// Abstract validation error class for this tag
export abstract class ExtXByteRangeValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-BYTERANGE';
}

// Concrete validation error classes
export class ExtXByteRangeNotAnObjectError extends ExtXByteRangeValidationError {
  readonly type: ValidationErrorType = 'not-an-object';
  readonly tagName = '#EXT-X-BYTERANGE';
  readonly description = 'EXT-X-BYTERANGE value must be an object (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXByteRangeMissingLengthError extends ExtXByteRangeValidationError {
  readonly type: ValidationErrorType = 'missing-length';
  readonly tagName = '#EXT-X-BYTERANGE';
  readonly description = 'EXT-X-BYTERANGE object must have a LENGTH property (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXByteRangeLengthNotANumberError extends ExtXByteRangeValidationError {
  readonly type: ValidationErrorType = 'length-not-a-number';
  readonly tagName = '#EXT-X-BYTERANGE';
  readonly description = 'EXT-X-BYTERANGE LENGTH must be a number (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXByteRangeLengthNegativeError extends ExtXByteRangeValidationError {
  readonly type: ValidationErrorType = 'length-negative';
  readonly tagName = '#EXT-X-BYTERANGE';
  readonly description = 'EXT-X-BYTERANGE LENGTH must be non-negative (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXByteRangeOffsetNotANumberError extends ExtXByteRangeValidationError {
  readonly type: ValidationErrorType = 'offset-not-a-number';
  readonly tagName = '#EXT-X-BYTERANGE';
  readonly description = 'EXT-X-BYTERANGE OFFSET must be a number when present (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXByteRangeOffsetNegativeError extends ExtXByteRangeValidationError {
  readonly type: ValidationErrorType = 'offset-negative';
  readonly tagName = '#EXT-X-BYTERANGE';
  readonly description = 'EXT-X-BYTERANGE OFFSET must be non-negative when present (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXByteRangeValidationErrorUnion =
  | ExtXByteRangeNotAnObjectError
  | ExtXByteRangeMissingLengthError
  | ExtXByteRangeLengthNotANumberError
  | ExtXByteRangeLengthNegativeError
  | ExtXByteRangeOffsetNotANumberError
  | ExtXByteRangeOffsetNegativeError; 