import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_STREAM_INF_PARSED,
    ExtXStreamInfValidationErrorUnion,
    ExtXStreamInfValidationResult,
    ExtXStreamInfBandwidthRequiredError,
    ExtXStreamInfBandwidthNotANumberError,
    ExtXStreamInfBandwidthNotAnIntegerError,
    ExtXStreamInfBandwidthNegativeValueError,
    ExtXStreamInfHdcpLevelInvalidError
} from './types';

/**
 * Validates EXT-X-STREAM-INF values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.4.2.4:
 * - BANDWIDTH is REQUIRED and must be a decimal-integer
 * - HDCP-LEVEL must be one of: TYPE-0, NONE
 * - AVERAGE-BANDWIDTH is OPTIONAL but must be a decimal-integer if present
 * - RESOLUTION is OPTIONAL but must be a decimal-resolution if present
 * - FRAME-RATE is OPTIONAL but must be a decimal-floating-point if present
 */
export class ExtXStreamInfValidator implements Validator<EXT_X_STREAM_INF_PARSED, ExtXStreamInfValidationErrorUnion> {
    validate(value: EXT_X_STREAM_INF_PARSED): ExtXStreamInfValidationResult {
        const errors: ExtXStreamInfValidationErrorUnion[] = [];

        // BANDWIDTH is REQUIRED
        if (value.BANDWIDTH === undefined || value.BANDWIDTH === null) {
            errors.push(new ExtXStreamInfBandwidthRequiredError(value));
        }

        // Check BANDWIDTH type and constraints if it exists
        if (value.BANDWIDTH !== undefined && value.BANDWIDTH !== null) {
            if (typeof value.BANDWIDTH !== 'number') {
                errors.push(new ExtXStreamInfBandwidthNotANumberError(value));
            } else {
                if (!Number.isInteger(value.BANDWIDTH)) {
                    errors.push(new ExtXStreamInfBandwidthNotAnIntegerError(value));
                }
                if (value.BANDWIDTH < 0) {
                    errors.push(new ExtXStreamInfBandwidthNegativeValueError(value));
                }
            }
        }

        // Check HDCP-LEVEL if present
        if (value['HDCP-LEVEL'] && !['TYPE-0', 'NONE'].includes(value['HDCP-LEVEL'])) {
            errors.push(new ExtXStreamInfHdcpLevelInvalidError(value));
        }

        return {
            tagName: '#EXT-X-STREAM-INF',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXStreamInfValidator = new ExtXStreamInfValidator(); 