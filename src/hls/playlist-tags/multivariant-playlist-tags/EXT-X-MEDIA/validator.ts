import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_MEDIA_PARSED,
    ExtXMediaValidationErrorUnion,
    ExtXMediaValidationResult,
    ExtXMediaTypeRequiredError,
    ExtXMediaUriNotAllowedError,
    ExtXMediaGroupIdRequiredError,
    ExtXMediaNameRequiredError,
    ExtXMediaAutoselectRequiredError,
    ExtXMediaForcedNotAllowedError,
    ExtXMediaInstreamIdRequiredError,
    ExtXMediaInstreamIdInvalidError,
    ExtXMediaInstreamIdNotAllowedError
} from './types';

/**
 * Validates EXT-X-MEDIA values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.4.2.1:
 * - TYPE is REQUIRED and must be one of: AUDIO, VIDEO, SUBTITLES, CLOSED-CAPTIONS
 * - URI is OPTIONAL but MUST NOT be present when TYPE is CLOSED-CAPTIONS
 * - GROUP-ID is REQUIRED
 * - NAME is REQUIRED
 * - AUTOSELECT must be YES if DEFAULT is YES
 * - FORCED MUST NOT be present unless TYPE is SUBTITLES
 * - INSTREAM-ID is REQUIRED when TYPE is CLOSED-CAPTIONS
 * - INSTREAM-ID must be one of: "CC1", "CC2", "CC3", "CC4", or "SERVICEn"
 */
export class ExtXMediaValidator implements Validator<EXT_X_MEDIA_PARSED, ExtXMediaValidationErrorUnion> {
    validate(value: EXT_X_MEDIA_PARSED): ExtXMediaValidationResult {
        const errors: ExtXMediaValidationErrorUnion[] = [];

        // Handle undefined/null values
        if (!value) {
            return {
                tagName: '#EXT-X-MEDIA',
                errors,
                isValid: true // No validation errors if no value
            };
        }

        // TYPE is REQUIRED
        if (!value.TYPE) {
            errors.push(new ExtXMediaTypeRequiredError(value));
        }

        // If TYPE is CLOSED-CAPTIONS then URI MUST NOT be present
        if (value.TYPE === 'CLOSED-CAPTIONS' && value.URI) {
            errors.push(new ExtXMediaUriNotAllowedError(value));
        }

        // GROUP-ID is REQUIRED
        if (!value['GROUP-ID']) {
            errors.push(new ExtXMediaGroupIdRequiredError(value));
        }

        // NAME is REQUIRED
        if (!value.NAME) {
            errors.push(new ExtXMediaNameRequiredError(value));
        }

        // AUTOSELECT must be YES if DEFAULT is YES
        if (value.DEFAULT === 'YES' && value.AUTOSELECT !== 'YES') {
            errors.push(new ExtXMediaAutoselectRequiredError(value));
        }

        // FORCED MUST NOT be present unless TYPE is SUBTITLES
        if (value.FORCED && value.TYPE !== 'SUBTITLES') {
            errors.push(new ExtXMediaForcedNotAllowedError(value));
        }

        // INSTREAM-ID is REQUIRED if the TYPE attribute is CLOSED-CAPTIONS
        if (value.TYPE === 'CLOSED-CAPTIONS' && !value['INSTREAM-ID']) {
            errors.push(new ExtXMediaInstreamIdRequiredError(value));
        }

        // INSTREAM-ID MUST have one of the values: "CC1", "CC2", "CC3", "CC4", or "SERVICEn"
        if (value.TYPE === 'CLOSED-CAPTIONS' && value['INSTREAM-ID']) {
            const validInstreamIds = ['CC1', 'CC2', 'CC3', 'CC4'];
            const isServiceN = /^SERVICE\d+$/.test(value['INSTREAM-ID']);
            if (!validInstreamIds.includes(value['INSTREAM-ID']) && !isServiceN) {
                errors.push(new ExtXMediaInstreamIdInvalidError(value));
            }
        }

        // For all other TYPE values, the INSTREAM-ID MUST NOT be specified
        if (value.TYPE !== 'CLOSED-CAPTIONS' && value['INSTREAM-ID']) {
            errors.push(new ExtXMediaInstreamIdNotAllowedError(value));
        }

        return {
            tagName: '#EXT-X-MEDIA',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXMediaValidator = new ExtXMediaValidator();

export default extXMediaValidator;
