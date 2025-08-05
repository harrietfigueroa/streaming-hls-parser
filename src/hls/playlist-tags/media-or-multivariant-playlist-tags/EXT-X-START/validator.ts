import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_START_PARSED,
    ExtXStartValidationErrorUnion,
    EXTXSTARTNotObjectError,
    EXTXSTARTMissingTimeOffsetError,
    EXTXSTARTInvalidTimeOffsetError,
    EXTXSTARTInvalidPreciseError
} from './types';

export interface ExtXStartValidationResult extends ValidationResult<ExtXStartValidationErrorUnion> {
    tagName: '#EXT-X-START';
}

/**
 * Validates EXT-X-START values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.2:
 * - The EXT-X-START tag indicates a preferred point at which to start playing a Playlist
 * - TIME-OFFSET is REQUIRED and must be a signed-decimal-floating-point number of seconds
 * - PRECISE is OPTIONAL and must be YES or NO
 */
export class ExtXStartValidator implements Validator<EXT_X_START_PARSED, ExtXStartValidationErrorUnion> {
    validate(value: EXT_X_START_PARSED): ExtXStartValidationResult {
        const errors: ExtXStartValidationErrorUnion[] = [];

        // Check if value is an object
        if (typeof value !== 'object' || value === null) {
            errors.push(new EXTXSTARTNotObjectError(value));
            return {
                tagName: '#EXT-X-START',
                errors,
                isValid: false
            };
        }

        // Check if TIME-OFFSET is present (required)
        if (!('TIME-OFFSET' in value)) {
            errors.push(new EXTXSTARTMissingTimeOffsetError(value));
        }

        // Check if TIME-OFFSET is a number
        if ('TIME-OFFSET' in value && typeof value['TIME-OFFSET'] !== 'number') {
            errors.push(new EXTXSTARTInvalidTimeOffsetError(value));
        }

        // Check if PRECISE is valid (if present)
        if ('PRECISE' in value && value.PRECISE !== undefined) {
            if (value.PRECISE !== 'YES' && value.PRECISE !== 'NO') {
                errors.push(new EXTXSTARTInvalidPreciseError(value));
            }
        }

        return {
            tagName: '#EXT-X-START',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXStartValidator = new ExtXStartValidator(); 