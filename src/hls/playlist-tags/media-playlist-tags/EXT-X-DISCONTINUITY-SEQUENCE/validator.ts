import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_DISCONTINUITY_SEQUENCE_PARSED,
    ExtXDiscontinuitySequenceValidationErrorUnion,
    EXTXDISCONTINUITYSEQUENCENotANumberError,
    EXTXDISCONTINUITYSEQUENCENotAnIntegerError,
    EXTXDISCONTINUITYSEQUENCENegativeValueError,
    EXTXDISCONTINUITYSEQUENCEExceedsMaximumError
} from './types';

export interface ExtXDiscontinuitySequenceValidationResult extends ValidationResult<ExtXDiscontinuitySequenceValidationErrorUnion> {
    tagName: '#EXT-X-DISCONTINUITY-SEQUENCE';
}

/**
 * Validates EXT-X-DISCONTINUITY-SEQUENCE values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.3.3:
 * - number is a decimal-integer
 * - If the Media Playlist does not contain an EXT-X-DISCONTINUITY-SEQUENCE tag, 
 *   then the Discontinuity Sequence Number of the first Media Segment in the Playlist 
 *   SHALL be considered to be 0
 * - The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first Media Segment in the Playlist
 * - The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-X-DISCONTINUITY tag
 */
export class ExtXDiscontinuitySequenceValidator implements Validator<EXT_X_DISCONTINUITY_SEQUENCE_PARSED, ExtXDiscontinuitySequenceValidationErrorUnion> {
    validate(value: EXT_X_DISCONTINUITY_SEQUENCE_PARSED): ExtXDiscontinuitySequenceValidationResult {
        const errors: ExtXDiscontinuitySequenceValidationErrorUnion[] = [];

        // Check if value is a number
        if (typeof value !== 'number') {
            errors.push(new EXTXDISCONTINUITYSEQUENCENotANumberError(value));
        }

        // Only perform additional checks if value is a number
        if (typeof value === 'number') {
            // Check if value is an integer
            if (!Number.isInteger(value)) {
                errors.push(new EXTXDISCONTINUITYSEQUENCENotAnIntegerError(value));
            }

            // Check if value is non-negative
            if (value < 0) {
                errors.push(new EXTXDISCONTINUITYSEQUENCENegativeValueError(value));
            }

            // Check if value is within reasonable bounds (0 to 2^32-1 as per RFC 8216 decimal-integer)
            if (value > 4294967295) {
                errors.push(new EXTXDISCONTINUITYSEQUENCEExceedsMaximumError(value));
            }
        }

        return {
            tagName: '#EXT-X-DISCONTINUITY-SEQUENCE',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXDiscontinuitySequenceValidator = new ExtXDiscontinuitySequenceValidator(); 