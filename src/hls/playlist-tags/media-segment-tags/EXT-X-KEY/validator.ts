import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_KEY_PARSED,
    EXT_X_KEY_METHOD,
    ExtXKeyValidationErrorUnion,
    ExtXKeyNotAnObjectError,
    ExtXKeyMissingMethodError,
    ExtXKeyInvalidMethodError,
    ExtXKeyNoneWithAttributesError,
    ExtXKeyMissingUriError
} from './types';

export interface ExtXKeyValidationResult extends ValidationResult<ExtXKeyValidationErrorUnion> {
    tagName: '#EXT-X-KEY';
}

/**
 * Validates EXT-X-KEY values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.4:
 * - METHOD is required
 * - If METHOD is NONE, other attributes MUST NOT be present
 * - If METHOD is not NONE, URI is required
 */
export class ExtXKeyValidator implements Validator<EXT_X_KEY_PARSED, ExtXKeyValidationErrorUnion> {
    validate(value: EXT_X_KEY_PARSED): ExtXKeyValidationResult {
        const errors: ExtXKeyValidationErrorUnion[] = [];

        // Check if value is an object
        if (typeof value !== 'object' || value === null) {
            errors.push(new ExtXKeyNotAnObjectError(value));
        }

        // Only perform additional checks if value is an object
        if (typeof value === 'object' && value !== null) {
            // Check if METHOD property exists
            if (!('METHOD' in value)) {
                errors.push(new ExtXKeyMissingMethodError(value));
            }

            // Check METHOD if it exists
            if ('METHOD' in value) {
                const method = value.METHOD;
                const isValidMethod = Object.values(EXT_X_KEY_METHOD).includes(method);

                if (!isValidMethod) {
                    errors.push(new ExtXKeyInvalidMethodError(value));
                } else {
                    // Only perform additional validation if METHOD is valid

                    // If METHOD is NONE, check that no other attributes are present
                    if (method === 'NONE') {
                        const disallowedAttributes = ['URI', 'IV', 'KEYFORMAT', 'KEYFORMATVERSIONS'];
                        for (const attr of disallowedAttributes) {
                            if (attr in value && value[attr as keyof EXT_X_KEY_PARSED] !== undefined) {
                                errors.push(new ExtXKeyNoneWithAttributesError(value));
                                break;
                            }
                        }
                    }

                    // If METHOD is not NONE, URI is required
                    if (method !== 'NONE' && (!('URI' in value) || value.URI === undefined)) {
                        errors.push(new ExtXKeyMissingUriError(value));
                    }
                }
            }
        }

        return {
            tagName: '#EXT-X-KEY',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXKeyValidator = new ExtXKeyValidator(); 