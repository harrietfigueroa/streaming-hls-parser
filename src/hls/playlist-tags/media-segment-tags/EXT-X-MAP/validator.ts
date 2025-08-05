import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_MAP_PARSED,
    ExtXMapValidationErrorUnion,
    ExtXMapNotAnObjectError,
    ExtXMapMissingUriError,
    ExtXMapInvalidUriError,
    ExtXMapInvalidByteRangeError
} from './types';

export interface ExtXMapValidationResult extends ValidationResult<ExtXMapValidationErrorUnion> {
    tagName: '#EXT-X-MAP';
}

/**
 * Validates EXT-X-MAP values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.5:
 * - URI is required
 * - URI must be a valid string
 * - BYTERANGE LENGTH must be a positive integer
 * - BYTERANGE OFFSET must be a non-negative integer (if present)
 */
export class ExtXMapValidator implements Validator<EXT_X_MAP_PARSED, ExtXMapValidationErrorUnion> {
    validate(value: EXT_X_MAP_PARSED): ExtXMapValidationResult {
        const errors: ExtXMapValidationErrorUnion[] = [];

        // Check if value is an object
        if (typeof value !== 'object' || value === null) {
            errors.push(new ExtXMapNotAnObjectError(value));
        }

        // Only perform additional checks if value is an object
        if (typeof value === 'object' && value !== null) {
            // Check if URI property exists
            if (!('URI' in value)) {
                errors.push(new ExtXMapMissingUriError(value));
            }

            // Check URI if it exists
            if ('URI' in value) {
                const uri = value.URI;
                if (typeof uri !== 'string') {
                    errors.push(new ExtXMapInvalidUriError(value));
                }
            }

            // Check BYTERANGE if it exists
            if ('BYTERANGE' in value && value.BYTERANGE !== undefined) {
                const byteRange = value.BYTERANGE;

                // Check LENGTH
                if (typeof byteRange.LENGTH !== 'number' || !Number.isInteger(byteRange.LENGTH) || byteRange.LENGTH <= 0) {
                    errors.push(new ExtXMapInvalidByteRangeError(value));
                }

                // Check OFFSET if present
                if (byteRange.OFFSET !== undefined) {
                    if (typeof byteRange.OFFSET !== 'number' || !Number.isInteger(byteRange.OFFSET) || byteRange.OFFSET < 0) {
                        errors.push(new ExtXMapInvalidByteRangeError(value));
                    }
                }
            }
        }

        return {
            tagName: '#EXT-X-MAP',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXMapValidator = new ExtXMapValidator(); 