import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_VERSION_PARSED,
    ExtXVersionValidationErrorUnion,
    EXTXVERSIONNotNumberError,
    EXTXVERSIONInvalidIntegerError
} from './types';

export interface ExtXVersionValidationResult extends ValidationResult<ExtXVersionValidationErrorUnion> {
    tagName: '#EXT-X-VERSION';
}

/**
 * Validates EXT-X-VERSION values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.1.2:
 * - n is an integer indicating the protocol compatibility version number
 * - The EXT-X-VERSION tag applies to the entire Playlist file
 */
export class ExtXVersionValidator implements Validator<EXT_X_VERSION_PARSED, ExtXVersionValidationErrorUnion> {
    validate(value: EXT_X_VERSION_PARSED): ExtXVersionValidationResult {
        const errors: ExtXVersionValidationErrorUnion[] = [];

        // Check if value is a number
        if (typeof value !== 'number') {
            errors.push(new EXTXVERSIONNotNumberError(value));
        }

        // Check if value is an integer
        if (typeof value === 'number' && !Number.isInteger(value)) {
            errors.push(new EXTXVERSIONInvalidIntegerError(value));
        }

        // Check if value is negative (EXT-X-VERSION must be positive)
        if (typeof value === 'number' && value < 0) {
            errors.push(new EXTXVERSIONInvalidIntegerError(value));
        }

        // Check if value exceeds maximum decimal-integer range (4294967295)
        if (typeof value === 'number' && value > 4294967295) {
            errors.push(new EXTXVERSIONInvalidIntegerError(value));
        }

        return {
            tagName: '#EXT-X-VERSION',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXVersionValidator = new ExtXVersionValidator(); 