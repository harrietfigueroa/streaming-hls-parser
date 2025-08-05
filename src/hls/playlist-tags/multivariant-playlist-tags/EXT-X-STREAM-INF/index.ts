import { extXStreamInfParser } from './parser';
import { extXStreamInfStringifier } from './stringifier';
import { extXStreamInfValidator } from './validator';
import {
    EXT_X_STREAM_INF_PARSED,
    EXT_X_STREAM_INF_STRING,
    ExtXStreamInfValidationErrorUnion,
    ExtXStreamInfValidationResult,
    ExtXStreamInfBandwidthRequiredError,
    ExtXStreamInfBandwidthNotANumberError,
    ExtXStreamInfBandwidthNotAnIntegerError,
    ExtXStreamInfBandwidthNegativeValueError,
    ExtXStreamInfHdcpLevelInvalidError
} from './types';

export {
    extXStreamInfParser,
    extXStreamInfStringifier,
    extXStreamInfValidator,
    ExtXStreamInfValidationErrorUnion,
    ExtXStreamInfValidationResult,
    ExtXStreamInfBandwidthRequiredError,
    ExtXStreamInfBandwidthNotANumberError,
    ExtXStreamInfBandwidthNotAnIntegerError,
    ExtXStreamInfBandwidthNegativeValueError,
    ExtXStreamInfHdcpLevelInvalidError,
    EXT_X_STREAM_INF_PARSED,
    EXT_X_STREAM_INF_STRING,
};

export const extXStreamInf = {
    kind: 'MultivariantPlaylist' as const,
    parser: extXStreamInfParser,
    stringifier: extXStreamInfStringifier,
    validator: extXStreamInfValidator,
} as const;

export default extXStreamInf; 