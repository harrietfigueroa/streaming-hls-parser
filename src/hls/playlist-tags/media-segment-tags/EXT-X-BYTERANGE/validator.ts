import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_BYTERANGE_PARSED,
    ExtXByteRangeValidationErrorUnion,
    ExtXByteRangeNotAnObjectError,
    ExtXByteRangeMissingLengthError,
    ExtXByteRangeLengthNotANumberError,
    ExtXByteRangeLengthNegativeError,
    ExtXByteRangeOffsetNotANumberError,
    ExtXByteRangeOffsetNegativeError
} from './types';

export interface ExtXByteRangeValidationResult extends ValidationResult<ExtXByteRangeValidationErrorUnion> {
    tagName: '#EXT-X-BYTERANGE';
}

/**
 * Validates EXT-X-BYTERANGE values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.2:
 * - LENGTH is required and must be a non-negative number
 * - OFFSET is optional but must be a non-negative number when present
 */
export class ExtXByteRangeValidator implements Validator<EXT_X_BYTERANGE_PARSED, ExtXByteRangeValidationErrorUnion> {
    validate(value: EXT_X_BYTERANGE_PARSED): ExtXByteRangeValidationResult {
        const errors: ExtXByteRangeValidationErrorUnion[] = [];

        // Check if value is an object
        if (typeof value !== 'object' || value === null) {
            errors.push(new ExtXByteRangeNotAnObjectError(value));
        }

        // Only perform additional checks if value is an object
        if (typeof value === 'object' && value !== null) {
            // Check if LENGTH property exists
            if (!('LENGTH' in value)) {
                errors.push(new ExtXByteRangeMissingLengthError(value));
            }

            // Check LENGTH if it exists
            if ('LENGTH' in value) {
                if (typeof value.LENGTH !== 'number') {
                    errors.push(new ExtXByteRangeLengthNotANumberError(value));
                } else if (value.LENGTH < 0) {
                    errors.push(new ExtXByteRangeLengthNegativeError(value));
                }
            }

            // Check OFFSET if it exists
            if ('OFFSET' in value && value.OFFSET !== undefined) {
                if (typeof value.OFFSET !== 'number') {
                    errors.push(new ExtXByteRangeOffsetNotANumberError(value));
                } else if (value.OFFSET < 0) {
                    errors.push(new ExtXByteRangeOffsetNegativeError(value));
                }
            }
        }

        return {
            tagName: '#EXT-X-BYTERANGE',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXByteRangeValidator = new ExtXByteRangeValidator(); 