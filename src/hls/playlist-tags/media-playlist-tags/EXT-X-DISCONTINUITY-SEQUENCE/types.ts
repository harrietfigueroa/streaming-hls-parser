/**
 * The EXT-X-DISCONTINUITY-SEQUENCE tag allows synchronization between
   different Renditions of the same Variant Stream or different Variant
   Streams that have EXT-X-DISCONTINUITY tags in their Media Playlists.

   Its format is:

   #EXT-X-DISCONTINUITY-SEQUENCE:<number>

   where number is a decimal-integer.

   If the Media Playlist does not contain an EXT-X-DISCONTINUITY-
   SEQUENCE tag, then the Discontinuity Sequence Number of the first
   Media Segment in the Playlist SHALL be considered to be 0.

   The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first
   Media Segment in the Playlist.

   The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-
   X-DISCONTINUITY tag.

   See Sections 6.2.1 and 6.2.2 for more information about setting the
   value of the EXT-X-DISCONTINUITY-SEQUENCE tag.
 */
export type EXT_X_DISCONTINUITY_SEQUENCE_PARSED = number;
export type EXT_X_DISCONTINUITY_SEQUENCE_STRING<discontinuitySequence extends number> = `#EXT-X-DISCONTINUITY-SEQUENCE:${discontinuitySequence}`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';



// Abstract validation error class for this tag
export abstract class ExtXDiscontinuitySequenceValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-DISCONTINUITY-SEQUENCE';
}

// Concrete validation error classes
export class EXTXDISCONTINUITYSEQUENCENotANumberError extends ExtXDiscontinuitySequenceValidationError {
  readonly type: ValidationErrorType = 'not-a-number';
  readonly tagName = '#EXT-X-DISCONTINUITY-SEQUENCE';
  readonly description = 'EXT-X-DISCONTINUITY-SEQUENCE value must be a number (RFC 8216 Section 4.3.3.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.3)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXDISCONTINUITYSEQUENCENotAnIntegerError extends ExtXDiscontinuitySequenceValidationError {
  readonly type: ValidationErrorType = 'not-an-integer';
  readonly tagName = '#EXT-X-DISCONTINUITY-SEQUENCE';
  readonly description = 'EXT-X-DISCONTINUITY-SEQUENCE value must be a decimal-integer (RFC 8216 Section 4.3.3.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.3)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXDISCONTINUITYSEQUENCENegativeValueError extends ExtXDiscontinuitySequenceValidationError {
  readonly type: ValidationErrorType = 'negative-value';
  readonly tagName = '#EXT-X-DISCONTINUITY-SEQUENCE';
  readonly description = 'EXT-X-DISCONTINUITY-SEQUENCE value must be non-negative (RFC 8216 Section 4.3.3.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.3)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXDISCONTINUITYSEQUENCEExceedsMaximumError extends ExtXDiscontinuitySequenceValidationError {
  readonly type: ValidationErrorType = 'exceeds-maximum';
  readonly tagName = '#EXT-X-DISCONTINUITY-SEQUENCE';
  readonly description = 'EXT-X-DISCONTINUITY-SEQUENCE value exceeds maximum decimal-integer range (0 to 2^32-1) (RFC 8216 Section 4.3.3.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.3)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXDiscontinuitySequenceValidationErrorUnion = 
  | EXTXDISCONTINUITYSEQUENCENotANumberError
  | EXTXDISCONTINUITYSEQUENCENotAnIntegerError
  | EXTXDISCONTINUITYSEQUENCENegativeValueError
  | EXTXDISCONTINUITYSEQUENCEExceedsMaximumError;