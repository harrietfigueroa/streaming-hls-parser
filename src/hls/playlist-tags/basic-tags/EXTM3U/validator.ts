import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXTM3U_PARSED,
    ExtM3uValidationErrorUnion,
    EXTM3UNotBooleanError
} from './types';

export interface ExtM3uValidationResult extends ValidationResult<ExtM3uValidationErrorUnion> {
    tagName: '#EXTM3U';
}

/**
 * Validates EXTM3U values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.1.1:
 * - The EXTM3U tag indicates that the file is an Extended M3U [M3U] Playlist file
 * - It MUST be the first line of every Media Playlist and every Master Playlist
 * - Its format is: #EXTM3U
 */
export class ExtM3uValidator implements Validator<EXTM3U_PARSED, ExtM3uValidationErrorUnion> {
    validate(value: EXTM3U_PARSED): ExtM3uValidationResult {
        const errors: ExtM3uValidationErrorUnion[] = [];

        // Check if value is a boolean
        if (typeof value !== 'boolean') {
            errors.push(new EXTM3UNotBooleanError(value));
        }

        return {
            tagName: '#EXTM3U',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extM3uValidator = new ExtM3uValidator(); 