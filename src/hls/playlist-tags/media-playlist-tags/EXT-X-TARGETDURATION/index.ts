import { extXTargetDurationParser } from './parser';
import { extXTargetDurationStringifier } from './stringifier';
import { extXTargetDurationValidator, ExtXTargetDurationValidationResult } from './validator';
import {
    EXT_X_TARGETDURATION_PARSED,
    EXT_X_TARGETDURATION_STRING,
    ExtXTargetDurationValidationErrorUnion,
    ExtXTargetDurationNotANumberError,
    ExtXTargetDurationNotAnIntegerError,
    ExtXTargetDurationNegativeValueError,
    ExtXTargetDurationExceedsMaximumError
} from './types';

export {
    extXTargetDurationParser,
    extXTargetDurationStringifier,
    extXTargetDurationValidator,
    ExtXTargetDurationValidationErrorUnion,
    ExtXTargetDurationValidationResult,
    ExtXTargetDurationNotANumberError,
    ExtXTargetDurationNotAnIntegerError,
    ExtXTargetDurationNegativeValueError,
    ExtXTargetDurationExceedsMaximumError,
    EXT_X_TARGETDURATION_PARSED,
    EXT_X_TARGETDURATION_STRING,
};

export const extXTargetDuration = {
    kind: 'MediaPlaylist' as const,
    parser: extXTargetDurationParser,
    stringifier: extXTargetDurationStringifier,
    validator: extXTargetDurationValidator,
} as const;

export default extXTargetDuration; 