import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_TARGETDURATION_PARSED,
    ExtXTargetDurationValidationErrorUnion,
    ExtXTargetDurationNotANumberError,
    ExtXTargetDurationNotAnIntegerError,
    ExtXTargetDurationNegativeValueError,
    ExtXTargetDurationExceedsMaximumError
} from './types';

export interface ExtXTargetDurationValidationResult extends ValidationResult<ExtXTargetDurationValidationErrorUnion> {
    tagName: '#EXT-X-TARGETDURATION';
}

/**
 * Validates EXT-X-TARGETDURATION values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.3.1:
 * - s is a decimal-integer indicating the target duration in seconds
 * - The EXT-X-TARGETDURATION tag is REQUIRED
 * - The EXTINF duration of each Media Segment MUST be less than or equal to the target duration
 */
export class ExtXTargetDurationValidator implements Validator<EXT_X_TARGETDURATION_PARSED, ExtXTargetDurationValidationErrorUnion> {
    validate(value: EXT_X_TARGETDURATION_PARSED): ExtXTargetDurationValidationResult {
        const errors: ExtXTargetDurationValidationErrorUnion[] = [];

        // Check if value is a number
        if (typeof value !== 'number') {
            errors.push(new ExtXTargetDurationNotANumberError(value));
        }

        // Only perform additional checks if value is a number
        if (typeof value === 'number') {
            // Check if value is an integer
            if (!Number.isInteger(value)) {
                errors.push(new ExtXTargetDurationNotAnIntegerError(value));
            }

            // Check if value is non-negative
            if (value < 0) {
                errors.push(new ExtXTargetDurationNegativeValueError(value));
            }

            // Check if value is within reasonable bounds (0 to 2^32-1 as per RFC 8216 decimal-integer)
            if (value > 4294967295) {
                errors.push(new ExtXTargetDurationExceedsMaximumError(value));
            }
        }

        return {
            tagName: '#EXT-X-TARGETDURATION',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXTargetDurationValidator = new ExtXTargetDurationValidator(); 