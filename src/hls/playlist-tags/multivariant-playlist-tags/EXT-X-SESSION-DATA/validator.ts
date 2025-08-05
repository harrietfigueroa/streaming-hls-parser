import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_SESSION_DATA_PARSED,
    ExtXSessionDataValidationErrorUnion,
    ExtXSessionDataValidationResult,
    ExtXSessionDataDataIdRequiredError,
    ExtXSessionDataValueOrUriRequiredError
} from './types';

/**
 * Validates EXT-X-SESSION-DATA values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.4.2.2:
 * - DATA-ID is REQUIRED
 * - Must contain either a VALUE or URI attribute, but not both
 */
export class ExtXSessionDataValidator implements Validator<EXT_X_SESSION_DATA_PARSED, ExtXSessionDataValidationErrorUnion> {
    validate(value: EXT_X_SESSION_DATA_PARSED): ExtXSessionDataValidationResult {
        const errors: ExtXSessionDataValidationErrorUnion[] = [];

        // DATA-ID is REQUIRED
        if (!value['DATA-ID']) {
            errors.push(new ExtXSessionDataDataIdRequiredError(value));
        }

        // Must contain either a VALUE or URI attribute, but not both
        if ((value.VALUE && value.URI) || (!value.VALUE && !value.URI)) {
            errors.push(new ExtXSessionDataValueOrUriRequiredError(value));
        }

        return {
            tagName: '#EXT-X-SESSION-DATA',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXSessionDataValidator = new ExtXSessionDataValidator();
