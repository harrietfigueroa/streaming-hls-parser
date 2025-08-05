import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_PROGRAM_DATE_TIME_PARSED,
    ExtXProgramDateTimeValidationErrorUnion,
    ExtXProgramDateTimeNotADateError,
    ExtXProgramDateTimeInvalidDateError
} from './types';

export interface ExtXProgramDateTimeValidationResult extends ValidationResult<ExtXProgramDateTimeValidationErrorUnion> {
    tagName: '#EXT-X-PROGRAM-DATE-TIME';
}

/**
 * Validates EXT-X-PROGRAM-DATE-TIME values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.3:
 * - value must be a Date object
 * - value must be a valid date (not NaN)
 */
export class ExtXProgramDateTimeValidator implements Validator<EXT_X_PROGRAM_DATE_TIME_PARSED, ExtXProgramDateTimeValidationErrorUnion> {
    validate(value: EXT_X_PROGRAM_DATE_TIME_PARSED): ExtXProgramDateTimeValidationResult {
        const errors: ExtXProgramDateTimeValidationErrorUnion[] = [];

        // Check if value is a Date object
        if (!(value instanceof Date)) {
            errors.push(new ExtXProgramDateTimeNotADateError(value));
        }

        // Only perform additional checks if value is a Date
        if (value instanceof Date) {
            // Check if the date is valid
            if (isNaN(value.getTime())) {
                errors.push(new ExtXProgramDateTimeInvalidDateError(value));
            }
        }

        return {
            tagName: '#EXT-X-PROGRAM-DATE-TIME',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXProgramDateTimeValidator = new ExtXProgramDateTimeValidator(); 