import { extXEndListParser } from './parser';
import { extXEndListStringifier } from './stringifier';
import { extXEndListValidator, ExtXEndListValidationResult } from './validator';
import {
    EXT_X_ENDLIST_PARSED,
    EXT_X_ENDLIST_STRING,
    ExtXEndListValidationErrorUnion,
    EXTXENDLISTNotABooleanError
} from './types';

export {
    extXEndListParser,
    extXEndListStringifier,
    extXEndListValidator,
    ExtXEndListValidationErrorUnion,
    ExtXEndListValidationResult,
    EXTXENDLISTNotABooleanError,
    EXT_X_ENDLIST_PARSED,
    EXT_X_ENDLIST_STRING,
};

export const extXEndList = {
    kind: 'MediaPlaylist' as const,
    parser: extXEndListParser,
    stringifier: extXEndListStringifier,
    validator: extXEndListValidator,
} as const;

export default extXEndList; 