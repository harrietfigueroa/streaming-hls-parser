import { extXIFramesOnlyParser } from './parser';
import { extXIFramesOnlyStringifier } from './stringifier';
import { extXIFramesOnlyValidator, ExtXIFramesOnlyValidationResult } from './validator';
import {
    EXT_X_I_FRAMES_ONLY_PARSED,
    EXT_X_I_FRAMES_ONLY_STRING,
    ExtXIFramesOnlyValidationErrorUnion,
    EXTXIFRAMESONLYNotABooleanError
} from './types';

export {
    extXIFramesOnlyParser,
    extXIFramesOnlyStringifier,
    extXIFramesOnlyValidator,
    ExtXIFramesOnlyValidationErrorUnion,
    ExtXIFramesOnlyValidationResult,
    EXTXIFRAMESONLYNotABooleanError,
    EXT_X_I_FRAMES_ONLY_PARSED,
    EXT_X_I_FRAMES_ONLY_STRING,
};

export const extXIFramesOnly = {
    kind: 'MediaPlaylist' as const,
    parser: extXIFramesOnlyParser,
    stringifier: extXIFramesOnlyStringifier,
    validator: extXIFramesOnlyValidator,
} as const;

export default extXIFramesOnly; 