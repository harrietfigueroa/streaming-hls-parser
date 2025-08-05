/**
 * The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
 * Media Segment that follows it and the one that preceded it.
 *
 * RFC 8216 Section 4.3.6.1:
 * - The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
 *   Media Segment that follows it and the one that preceded it.
 * - Its format is: #EXT-X-DISCONTINUITY
 */
export type EXT_X_DISCONTINUITY_PARSED = boolean;
export type EXT_X_DISCONTINUITY_STRING = `#EXT-X-DISCONTINUITY\n`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

// Abstract validation error class for this tag
export abstract class ExtXDiscontinuityValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-DISCONTINUITY';
}

// Concrete validation error classes
export class EXTXDISCONTINUITYNotABooleanError extends ExtXDiscontinuityValidationError {
    readonly type: ValidationErrorType = 'not-a-boolean';
    readonly tagName = '#EXT-X-DISCONTINUITY';
    readonly description = 'EXT-X-DISCONTINUITY value must be a boolean (RFC 8216 Section 4.3.6.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.6.1)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtXDiscontinuityValidationErrorUnion =
    | EXTXDISCONTINUITYNotABooleanError; 