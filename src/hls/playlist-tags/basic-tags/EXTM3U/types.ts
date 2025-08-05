/**
 * The EXTM3U tag indicates that the file is an Extended M3U [M3U]
   Playlist file.  It MUST be the first line of every Media Playlist and
   every Master Playlist.  Its format is:

   #EXTM3U
 */
export type EXTM3U_PARSED = boolean | undefined;
export type EXTM3U_STRING = `#EXTM3U`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

// Abstract validation error class for this tag
export abstract class ExtM3uValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXTM3U';
}

// Concrete validation error classes
export class EXTM3UNotBooleanError extends ExtM3uValidationError {
    readonly type: ValidationErrorType = 'not-a-boolean';
    readonly tagName = '#EXTM3U';
    readonly description = 'EXTM3U value must be a boolean (RFC 8216 Section 4.3.1.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.1.1)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtM3uValidationErrorUnion = EXTM3UNotBooleanError; 