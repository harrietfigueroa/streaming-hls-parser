import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

/**
 * The EXT-X-MEDIA-SEQUENCE tag indicates the Media Sequence Number of
   the first Media Segment that appears in a Playlist file.  Its format
   is:

   #EXT-X-MEDIA-SEQUENCE:<number>

   where number is a decimal-integer.

   If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE
   tag, then the Media Sequence Number of the first Media Segment in the
   Media Playlist SHALL be considered to be 0.  A client MUST NOT assume
   that segments with the same Media Sequence Number in different Media
   Playlists contain matching content (see Section 6.3.2).
 */
export type EXT_X_MEDIA_SEQUENCE_PARSED = number;
export type EXT_X_MEDIA_SEQUENCE_STRING<mediaSequence extends number> = `#EXT-X-MEDIA-SEQUENCE:${mediaSequence}`;

// Abstract validation error class for this tag
export abstract class ExtXMediaSequenceValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-MEDIA-SEQUENCE';
}

// Concrete validation error classes
export class ExtXMediaSequenceNotANumberError extends ExtXMediaSequenceValidationError {
  readonly type: ValidationErrorType = 'not-a-number';
  readonly tagName = '#EXT-X-MEDIA-SEQUENCE';
  readonly description = 'EXT-X-MEDIA-SEQUENCE value must be a number (RFC 8216 Section 4.3.3.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXMediaSequenceNotAnIntegerError extends ExtXMediaSequenceValidationError {
  readonly type: ValidationErrorType = 'not-an-integer';
  readonly tagName = '#EXT-X-MEDIA-SEQUENCE';
  readonly description = 'EXT-X-MEDIA-SEQUENCE value must be a decimal-integer (RFC 8216 Section 4.3.3.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXMediaSequenceNegativeValueError extends ExtXMediaSequenceValidationError {
  readonly type: ValidationErrorType = 'negative-value';
  readonly tagName = '#EXT-X-MEDIA-SEQUENCE';
  readonly description = 'EXT-X-MEDIA-SEQUENCE value must be non-negative (RFC 8216 Section 4.3.3.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class ExtXMediaSequenceExceedsMaximumError extends ExtXMediaSequenceValidationError {
  readonly type: ValidationErrorType = 'exceeds-maximum';
  readonly tagName = '#EXT-X-MEDIA-SEQUENCE';
  readonly description = 'EXT-X-MEDIA-SEQUENCE value exceeds maximum decimal-integer range (0 to 2^32-1) (RFC 8216 Section 4.3.3.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXMediaSequenceValidationErrorUnion =
  | ExtXMediaSequenceNotANumberError
  | ExtXMediaSequenceNotAnIntegerError
  | ExtXMediaSequenceNegativeValueError
  | ExtXMediaSequenceExceedsMaximumError; 