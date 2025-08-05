import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import { extXStreamInfValidator } from '../EXT-X-STREAM-INF/validator';
import {
    EXT_X_I_FRAME_STREAM_INF_PARSED,
    ExtXIFrameStreamInfValidationErrorUnion,
    ExtXIFrameStreamInfValidationResult,
    ExtXIFrameStreamInfUriRequiredError
} from './types';

/**
 * Validates EXT-X-I-FRAME-STREAM-INF values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.4.3:
 * - Every EXT-X-I-FRAME-STREAM-INF tag MUST include a BANDWIDTH attribute and a URI attribute
 * - All attributes defined for EXT-X-STREAM-INF are also defined for EXT-X-I-FRAME-STREAM-INF
 *   except for FRAME-RATE, AUDIO, SUBTITLES, and CLOSED-CAPTIONS attributes
 */
export class ExtXIFrameStreamInfValidator implements Validator<EXT_X_I_FRAME_STREAM_INF_PARSED, ExtXIFrameStreamInfValidationErrorUnion> {
    validate(value: EXT_X_I_FRAME_STREAM_INF_PARSED): ExtXIFrameStreamInfValidationResult {
        const errors: ExtXIFrameStreamInfValidationErrorUnion[] = [];

        // URI is REQUIRED
        if (!value.URI) {
            errors.push(new ExtXIFrameStreamInfUriRequiredError(value));
        }

        // Use the EXT-X-STREAM-INF validator for all other validations
        const streamInfValidationResult = extXStreamInfValidator.validate(value);
        // Convert the errors to the correct type
        const convertedErrors = streamInfValidationResult.errors.map(error => ({
            ...error,
            type: error.type as any // Type assertion for compatibility
        })) as ExtXIFrameStreamInfValidationErrorUnion[];
        errors.push(...convertedErrors);

        return {
            tagName: '#EXT-X-I-FRAME-STREAM-INF',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXIFrameStreamInfValidator = new ExtXIFrameStreamInfValidator(); 