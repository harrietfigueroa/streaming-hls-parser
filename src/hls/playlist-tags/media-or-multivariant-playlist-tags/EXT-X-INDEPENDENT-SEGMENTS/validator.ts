import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_INDEPENDENT_SEGMENTS_PARSED,
    ExtXIndependentSegmentsValidationErrorUnion,
    EXTXINDEPENDENTSEGMENTSNotBooleanError
} from './types';

export interface ExtXIndependentSegmentsValidationResult extends ValidationResult<ExtXIndependentSegmentsValidationErrorUnion> {
    tagName: '#EXT-X-INDEPENDENT-SEGMENTS';
}

/**
 * Validates EXT-X-INDEPENDENT-SEGMENTS values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.1:
 * - The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples in a Media Segment can be decoded without information from other segments
 * - It applies to every Media Segment in the Playlist
 * - Its format is: #EXT-X-INDEPENDENT-SEGMENTS
 */
export class ExtXIndependentSegmentsValidator implements Validator<EXT_X_INDEPENDENT_SEGMENTS_PARSED, ExtXIndependentSegmentsValidationErrorUnion> {
    validate(value: EXT_X_INDEPENDENT_SEGMENTS_PARSED): ExtXIndependentSegmentsValidationResult {
        const errors: ExtXIndependentSegmentsValidationErrorUnion[] = [];

        // Check if value is a boolean
        if (typeof value !== 'boolean') {
            errors.push(new EXTXINDEPENDENTSEGMENTSNotBooleanError(value));
        }

        return {
            tagName: '#EXT-X-INDEPENDENT-SEGMENTS',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXIndependentSegmentsValidator = new ExtXIndependentSegmentsValidator(); 