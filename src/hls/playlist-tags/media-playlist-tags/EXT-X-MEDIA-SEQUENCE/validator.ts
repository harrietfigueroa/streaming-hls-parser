import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_MEDIA_SEQUENCE_PARSED,
    ExtXMediaSequenceValidationErrorUnion,
    ExtXMediaSequenceNotANumberError,
    ExtXMediaSequenceNotAnIntegerError,
    ExtXMediaSequenceNegativeValueError,
    ExtXMediaSequenceExceedsMaximumError
} from './types';

export interface ExtXMediaSequenceValidationResult extends ValidationResult<ExtXMediaSequenceValidationErrorUnion> {
    tagName: '#EXT-X-MEDIA-SEQUENCE';
}

/**
 * Validates EXT-X-MEDIA-SEQUENCE values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.3.2:
 * - number is a decimal-integer
 * - If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE tag, 
 *   then the Media Sequence Number of the first Media Segment in the Media Playlist 
 *   SHALL be considered to be 0
 * - The EXT-X-MEDIA-SEQUENCE tag MUST appear before the first Media Segment in the Playlist
 */
export class ExtXMediaSequenceValidator implements Validator<EXT_X_MEDIA_SEQUENCE_PARSED, ExtXMediaSequenceValidationErrorUnion> {
    validate(value: EXT_X_MEDIA_SEQUENCE_PARSED): ExtXMediaSequenceValidationResult {
        const errors: ExtXMediaSequenceValidationErrorUnion[] = [];

        // Check if value is a number
        if (typeof value !== 'number') {
            errors.push(new ExtXMediaSequenceNotANumberError(value));
        }

        // Only perform additional checks if value is a number
        if (typeof value === 'number') {
            // Check if value is an integer
            if (!Number.isInteger(value)) {
                errors.push(new ExtXMediaSequenceNotAnIntegerError(value));
            }

            // Check if value is non-negative
            if (value < 0) {
                errors.push(new ExtXMediaSequenceNegativeValueError(value));
            }

            // Check if value is within reasonable bounds (0 to 2^32-1 as per RFC 8216 decimal-integer)
            if (value > 4294967295) {
                errors.push(new ExtXMediaSequenceExceedsMaximumError(value));
            }
        }

        return {
            tagName: '#EXT-X-MEDIA-SEQUENCE',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXMediaSequenceValidator = new ExtXMediaSequenceValidator(); 