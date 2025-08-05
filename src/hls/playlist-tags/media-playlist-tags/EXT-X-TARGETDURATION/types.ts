import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

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
export type EXT_X_TARGETDURATION_PARSED = number;
export type EXT_X_TARGETDURATION_STRING<targetDuration extends number> = `#EXT-X-TARGETDURATION:${targetDuration}`;

// Abstract validation error class for this tag
export abstract class ExtXTargetDurationValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-TARGETDURATION';
}

// Concrete validation error classes
export class ExtXTargetDurationNotANumberError extends ExtXTargetDurationValidationError {
  readonly type: ValidationErrorType = 'not-a-number';
  readonly tagName = '#EXT-X-TARGETDURATION';
  readonly description = 'EXT-X-TARGETDURATION value must be a number (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXTargetDurationNotAnIntegerError extends ExtXTargetDurationValidationError {
  readonly type: ValidationErrorType = 'not-an-integer';
  readonly tagName = '#EXT-X-TARGETDURATION';
  readonly description = 'EXT-X-TARGETDURATION value must be a decimal-integer (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXTargetDurationNegativeValueError extends ExtXTargetDurationValidationError {
  readonly type: ValidationErrorType = 'negative-value';
  readonly tagName = '#EXT-X-TARGETDURATION';
  readonly description = 'EXT-X-TARGETDURATION value must be non-negative (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXTargetDurationExceedsMaximumError extends ExtXTargetDurationValidationError {
  readonly type: ValidationErrorType = 'exceeds-maximum';
  readonly tagName = '#EXT-X-TARGETDURATION';
  readonly description = 'EXT-X-TARGETDURATION value exceeds maximum decimal-integer range (0 to 2^32-1) (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXTargetDurationValidationErrorUnion =
  | ExtXTargetDurationNotANumberError
  | ExtXTargetDurationNotAnIntegerError
  | ExtXTargetDurationNegativeValueError
  | ExtXTargetDurationExceedsMaximumError; 