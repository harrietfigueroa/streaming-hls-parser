import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

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
export interface EXTINF_PARSED {
  /**
 * Duration is a decimal-floating-point or decimal-integer number
 (as described in Section 4.2) that specifies the duration of the
 Media Segment in seconds.  Durations SHOULD be decimal-floating-
 point, with enough accuracy to avoid perceptible error when segment
 durations are accumulated.  However, if the compatibility version
 number is less than 3, durations MUST be integers.  Durations that
 are reported as integers SHOULD be rounded to the nearest integer.
 */
  DURATION: number;

  /**
   * an optional human-readable informative title of the Media Segment expressed as UTF-8
   */
  TITLE?: string;

  /**
   * Original duration string format for precision preservation
   */
  _originalDuration?: string;
}

export type EXTINF_STRING = `#EXTINF:${number},${string}` | `#EXTINF:${number}`;

// Abstract validation error class for this tag
export abstract class ExtinfValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXTINF';
}

// Concrete validation error classes
export class ExtinfNotAnObjectError extends ExtinfValidationError {
  readonly type: ValidationErrorType = 'not-an-object';
  readonly tagName = '#EXTINF';
  readonly description = 'EXTINF value must be an object (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtinfMissingDurationError extends ExtinfValidationError {
  readonly type: ValidationErrorType = 'missing-duration';
  readonly tagName = '#EXTINF';
  readonly description = 'EXTINF object must have a DURATION property (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtinfDurationNotANumberError extends ExtinfValidationError {
  readonly type: ValidationErrorType = 'duration-not-a-number';
  readonly tagName = '#EXTINF';
  readonly description = 'EXTINF DURATION must be a number (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtinfDurationNegativeError extends ExtinfValidationError {
  readonly type: ValidationErrorType = 'duration-negative';
  readonly tagName = '#EXTINF';
  readonly description = 'EXTINF DURATION must be non-negative (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtinfTitleNotStringError extends ExtinfValidationError {
  readonly type: ValidationErrorType = 'title-not-string';
  readonly tagName = '#EXTINF';
  readonly description = 'EXTINF TITLE must be a string when present (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtinfValidationErrorUnion =
  | ExtinfNotAnObjectError
  | ExtinfMissingDurationError
  | ExtinfDurationNotANumberError
  | ExtinfDurationNegativeError
  | ExtinfTitleNotStringError;