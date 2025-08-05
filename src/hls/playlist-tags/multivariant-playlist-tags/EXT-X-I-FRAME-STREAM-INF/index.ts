import { extXIFrameStreamInfParser } from './parser';
import { extXIFrameStreamInfStringifier } from './stringifier';
import { extXIFrameStreamInfValidator } from './validator';
import {
    EXT_X_I_FRAME_STREAM_INF_PARSED,
    EXT_X_I_FRAME_STREAM_INF_STRING,
    ExtXIFrameStreamInfValidationErrorUnion,
    ExtXIFrameStreamInfValidationResult,
    ExtXIFrameStreamInfUriRequiredError
} from './types';

export {
    extXIFrameStreamInfParser,
    extXIFrameStreamInfStringifier,
    extXIFrameStreamInfValidator,
    ExtXIFrameStreamInfValidationErrorUnion,
    ExtXIFrameStreamInfValidationResult,
    ExtXIFrameStreamInfUriRequiredError,
    EXT_X_I_FRAME_STREAM_INF_PARSED,
    EXT_X_I_FRAME_STREAM_INF_STRING,
};

export const extXIFrameStreamInf = {
    kind: 'MultivariantPlaylist' as const,
    parser: extXIFrameStreamInfParser,
    stringifier: extXIFrameStreamInfStringifier,
    validator: extXIFrameStreamInfValidator,
} as const;

export default extXIFrameStreamInf; 