/**
 * The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples
   in a Media Segment can be decoded without information from other
   segments.  It applies to every Media Segment in the Playlist.

   Its format is:

   #EXT-X-INDEPENDENT-SEGMENTS
 */
export type EXT_X_INDEPENDENT_SEGMENTS_PARSED = boolean | undefined;
export type EXT_X_INDEPENDENT_SEGMENTS_STRING = `#EXT-X-INDEPENDENT-SEGMENTS`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

// Abstract validation error class for this tag
export abstract class ExtXIndependentSegmentsValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-INDEPENDENT-SEGMENTS';
}

// Concrete validation error classes
export class EXTXINDEPENDENTSEGMENTSNotBooleanError extends ExtXIndependentSegmentsValidationError {
  readonly type: ValidationErrorType = 'not-a-boolean';
  readonly tagName = '#EXT-X-INDEPENDENT-SEGMENTS';
  readonly description = 'EXT-X-INDEPENDENT-SEGMENTS value must be a boolean (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXIndependentSegmentsValidationErrorUnion = EXTXINDEPENDENTSEGMENTSNotBooleanError;
