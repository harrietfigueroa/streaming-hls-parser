/**
 * The EXT-X-ENDLIST tag indicates that no more Media Segments will be
   added to the Media Playlist file.  It MAY occur anywhere in the Media
   Playlist file.  Its format is:

   #EXT-X-ENDLIST
 */
export type EXT_X_ENDLIST_PARSED = boolean;
export type EXT_X_ENDLIST_STRING = `#EXT-X-ENDLIST\n`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';



// Abstract validation error class for this tag
export abstract class ExtXEndListValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-ENDLIST';
}

// Concrete validation error classes
export class EXTXENDLISTNotABooleanError extends ExtXEndListValidationError {
  readonly type: ValidationErrorType = 'not-a-boolean';
  readonly tagName = '#EXT-X-ENDLIST';
  readonly description = 'EXT-X-ENDLIST value must be a boolean (RFC 8216 Section 4.3.3.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.4)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXEndListValidationErrorUnion =
  | EXTXENDLISTNotABooleanError;
