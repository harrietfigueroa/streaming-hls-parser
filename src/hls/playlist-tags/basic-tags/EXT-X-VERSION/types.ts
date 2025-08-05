/**
 * The EXT-X-VERSION tag indicates the compatibility version of the
   Playlist file, its associated media, and its server.

   The EXT-X-VERSION tag applies to the entire Playlist file.  Its
   format is:

   #EXT-X-VERSION:<n>

   where n is an integer indicating the protocol compatibility version
   number.
 */
export type EXT_X_VERSION_PARSED = number | undefined;
export type EXT_X_VERSION_STRING = `#EXT-X-VERSION:${number}`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

// Abstract validation error class for this tag
export abstract class ExtXVersionValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-VERSION';
}

// Concrete validation error classes
export class EXTXVERSIONNotNumberError extends ExtXVersionValidationError {
    readonly type: ValidationErrorType = 'not-a-number';
    readonly tagName = '#EXT-X-VERSION';
    readonly description = 'EXT-X-VERSION value must be a number (RFC 8216 Section 4.3.1.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.1.2)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXVERSIONInvalidIntegerError extends ExtXVersionValidationError {
    readonly type: ValidationErrorType = 'not-an-integer';
    readonly tagName = '#EXT-X-VERSION';
    readonly description = 'EXT-X-VERSION value must be an integer (RFC 8216 Section 4.3.1.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.1.2)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtXVersionValidationErrorUnion =
    | EXTXVERSIONNotNumberError
    | EXTXVERSIONInvalidIntegerError; 