import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXTINF_PARSED,
    ExtinfValidationErrorUnion,
    ExtinfNotAnObjectError,
    ExtinfMissingDurationError,
    ExtinfDurationNotANumberError,
    ExtinfDurationNegativeError,
    ExtinfTitleNotStringError
} from './types';

export interface ExtinfValidationResult extends ValidationResult<ExtinfValidationErrorUnion> {
    tagName: '#EXTINF';
}

/**
 * Validates EXTINF values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.1:
 * - duration is a decimal-floating-point or decimal-integer number
 * - title is optional human-readable informative title
 * - This tag is REQUIRED for each Media Segment
 */
export class ExtinfValidator implements Validator<EXTINF_PARSED, ExtinfValidationErrorUnion> {
    validate(value: EXTINF_PARSED): ExtinfValidationResult {
        const errors: ExtinfValidationErrorUnion[] = [];

        // Check if value is an object
        if (typeof value !== 'object' || value === null) {
            errors.push(new ExtinfNotAnObjectError(value));
        }

        // Only perform additional checks if value is an object
        if (typeof value === 'object' && value !== null) {
            // Check if DURATION property exists
            if (!('DURATION' in value)) {
                errors.push(new ExtinfMissingDurationError(value));
            }

            // Check DURATION if it exists
            if ('DURATION' in value) {
                if (typeof value.DURATION !== 'number') {
                    errors.push(new ExtinfDurationNotANumberError(value));
                } else if (value.DURATION < 0) {
                    errors.push(new ExtinfDurationNegativeError(value));
                }
            }

            // Check TITLE if it exists
            if ('TITLE' in value && value.TITLE !== undefined) {
                if (typeof value.TITLE !== 'string') {
                    errors.push(new ExtinfTitleNotStringError(value));
                }
            }
        }

        return {
            tagName: '#EXTINF',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extinfValidator = new ExtinfValidator(); 