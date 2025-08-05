import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

/**
 * The EXT-X-PROGRAM-DATE-TIME tag associates the first sample of a
   Media Segment with an absolute date and/or time.  It applies only to
   the next Media Segment.  Its format is:

   #EXT-X-PROGRAM-DATE-TIME:<date-time-msec>

   where date-time-msec is an ISO/IEC 8601:2004 [ISO_8601] date/time
   representation, such as YYYY-MM-DDThh:mm:ss.SSSZ.  It SHOULD indicate
   a time zone and fractional parts of seconds, to millisecond accuracy.

   For example:

   #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00

   See Sections 6.2.1 and 6.3.3 for more information on the EXT-X-
   PROGRAM-DATE-TIME tag.
 */
export type EXT_X_PROGRAM_DATE_TIME_PARSED = Date;
export type EXT_X_PROGRAM_DATE_TIME_STRING = `#EXT-X-PROGRAM-DATE-TIME:${string}`;

// Abstract validation error class for this tag
export abstract class ExtXProgramDateTimeValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-PROGRAM-DATE-TIME';
}

// Concrete validation error classes
export class ExtXProgramDateTimeNotADateError extends ExtXProgramDateTimeValidationError {
  readonly type: ValidationErrorType = 'not-a-date';
  readonly tagName = '#EXT-X-PROGRAM-DATE-TIME';
  readonly description = 'EXT-X-PROGRAM-DATE-TIME value must be a Date object (RFC 8216 Section 4.3.2.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.3)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXProgramDateTimeInvalidDateError extends ExtXProgramDateTimeValidationError {
  readonly type: ValidationErrorType = 'invalid-date';
  readonly tagName = '#EXT-X-PROGRAM-DATE-TIME';
  readonly description = 'EXT-X-PROGRAM-DATE-TIME value must be a valid Date (RFC 8216 Section 4.3.2.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.3)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXProgramDateTimeValidationErrorUnion =
  | ExtXProgramDateTimeNotADateError
  | ExtXProgramDateTimeInvalidDateError; 