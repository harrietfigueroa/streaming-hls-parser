import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_DISCONTINUITY_PARSED,
    ExtXDiscontinuityValidationErrorUnion,
    EXTXDISCONTINUITYNotABooleanError
} from './types';

export interface ExtXDiscontinuityValidationResult extends ValidationResult<ExtXDiscontinuityValidationErrorUnion> {
    tagName: '#EXT-X-DISCONTINUITY';
}

/**
 * Validates EXT-X-DISCONTINUITY values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.6.1:
 * - The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
 *   Media Segment that follows it and the one that preceded it.
 * - Its format is: #EXT-X-DISCONTINUITY (no value)
 */
export class ExtXDiscontinuityValidator implements Validator<EXT_X_DISCONTINUITY_PARSED, ExtXDiscontinuityValidationErrorUnion> {
    validate(value: EXT_X_DISCONTINUITY_PARSED): ExtXDiscontinuityValidationResult {
        // Boolean tags are always valid when present (parser only returns true when tag exists)
        // No validation needed since there's no value to validate
        return {
            tagName: '#EXT-X-DISCONTINUITY',
            errors: [],
            isValid: true
        };
    }
}

export const extXDiscontinuityValidator = new ExtXDiscontinuityValidator(); 