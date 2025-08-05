import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_I_FRAMES_ONLY_PARSED,
    ExtXIFramesOnlyValidationErrorUnion,
    EXTXIFRAMESONLYNotABooleanError
} from './types';

export interface ExtXIFramesOnlyValidationResult extends ValidationResult<ExtXIFramesOnlyValidationErrorUnion> {
    tagName: '#EXT-X-I-FRAMES-ONLY';
}

/**
 * Validates EXT-X-I-FRAMES-ONLY values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.3.6:
 * - The EXT-X-I-FRAMES-ONLY tag indicates that each Media Segment in the Playlist describes a single I-frame
 * - Its format is: #EXT-X-I-FRAMES-ONLY (no value)
 * - Use of the EXT-X-I-FRAMES-ONLY REQUIRES a compatibility version number of 4 or greater
 */
export class ExtXIFramesOnlyValidator implements Validator<EXT_X_I_FRAMES_ONLY_PARSED, ExtXIFramesOnlyValidationErrorUnion> {
    validate(value: EXT_X_I_FRAMES_ONLY_PARSED): ExtXIFramesOnlyValidationResult {
        const errors: ExtXIFramesOnlyValidationErrorUnion[] = [];

        // Check if value is a boolean (true indicates presence of the tag)
        if (typeof value !== 'boolean') {
            errors.push(new EXTXIFRAMESONLYNotABooleanError(value));
        }

        // EXT-X-I-FRAMES-ONLY is a standalone tag with no value, so the parsed value should be true
        // when the tag is present. The validation is simple - just ensure it's a boolean.
        // The actual presence/absence is handled by the parser, not the validator.

        return {
            tagName: '#EXT-X-I-FRAMES-ONLY',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXIFramesOnlyValidator = new ExtXIFramesOnlyValidator(); 