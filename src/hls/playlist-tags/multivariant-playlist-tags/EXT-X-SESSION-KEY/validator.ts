import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import { extXKeyValidator } from '../../media-segment-tags/EXT-X-KEY/validator';
import {
    EXT_X_SESSION_KEY_PARSED,
    ExtXSessionKeyValidationErrorUnion,
    ExtXSessionKeyValidationResult,
    ExtXSessionKeyMethodNoneError
} from './types';

/**
 * Validates EXT-X-SESSION-KEY values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.4.2.3:
 * - All attributes defined for the EXT-X-KEY tag are also defined for EXT-X-SESSION-KEY
 * - The value of the METHOD attribute MUST NOT be NONE
 */
export class ExtXSessionKeyValidator implements Validator<EXT_X_SESSION_KEY_PARSED, ExtXSessionKeyValidationErrorUnion> {
    validate(value: EXT_X_SESSION_KEY_PARSED): ExtXSessionKeyValidationResult {
        const errors: ExtXSessionKeyValidationErrorUnion[] = [];

        // Handle undefined/null values
        if (!value) {
            return {
                tagName: '#EXT-X-SESSION-KEY',
                errors,
                isValid: true // No validation errors if no value
            };
        }

        // Check if METHOD is NONE (which is not allowed for EXT-X-SESSION-KEY)
        if (value.METHOD === 'NONE') {
            errors.push(new ExtXSessionKeyMethodNoneError(value));
        }

        // Use the EXT-X-KEY validator for all other validations
        const keyValidationResult = extXKeyValidator.validate(value);
        // Convert the errors to the correct type
        const convertedErrors = keyValidationResult.errors.map(error => ({
            ...error,
            type: error.type as any // Type assertion for compatibility
        })) as ExtXSessionKeyValidationErrorUnion[];
        errors.push(...convertedErrors);

        return {
            tagName: '#EXT-X-SESSION-KEY',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXSessionKeyValidator = new ExtXSessionKeyValidator();

export default extXSessionKeyValidator;
