import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_ENDLIST_PARSED,
    ExtXEndListValidationErrorUnion,
    EXTXENDLISTNotABooleanError
} from './types';

export interface ExtXEndListValidationResult extends ValidationResult<ExtXEndListValidationErrorUnion> {
    tagName: '#EXT-X-ENDLIST';
}

/**
 * Validates EXT-X-ENDLIST values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.3.4:
 * - The EXT-X-ENDLIST tag indicates that no more Media Segments will be added to the Media Playlist file
 * - It MAY occur anywhere in the Media Playlist file
 * - Its format is: #EXT-X-ENDLIST (no value)
 */
export class ExtXEndListValidator implements Validator<EXT_X_ENDLIST_PARSED, ExtXEndListValidationErrorUnion> {
    validate(value: EXT_X_ENDLIST_PARSED): ExtXEndListValidationResult {
        const errors: ExtXEndListValidationErrorUnion[] = [];

        // Check if value is a boolean (true indicates presence of the tag)
        if (typeof value !== 'boolean') {
            errors.push(new EXTXENDLISTNotABooleanError(value));
        }

        // EXT-X-ENDLIST is a standalone tag with no value, so the parsed value should be true
        // when the tag is present. The validation is simple - just ensure it's a boolean.
        // The actual presence/absence is handled by the parser, not the validator.

        return {
            tagName: '#EXT-X-ENDLIST',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXEndListValidator = new ExtXEndListValidator(); 