import { extXVersionParser } from './parser';
import { extXVersionStringifier } from './stringifier';
import { extXVersionValidator, ExtXVersionValidationResult } from './validator';
import {
    EXT_X_VERSION_PARSED,
    EXT_X_VERSION_STRING,
    ExtXVersionValidationErrorUnion,
    EXTXVERSIONNotNumberError,
    EXTXVERSIONInvalidIntegerError
} from './types';

export {
    extXVersionParser,
    extXVersionStringifier,
    extXVersionValidator,
    ExtXVersionValidationErrorUnion,
    ExtXVersionValidationResult,
    EXTXVERSIONNotNumberError,
    EXTXVERSIONInvalidIntegerError,
    EXT_X_VERSION_PARSED,
    EXT_X_VERSION_STRING,
};

export const extXVersion = {
    kind: 'Basic' as const,
    parser: extXVersionParser,
    stringifier: extXVersionStringifier,
    validator: extXVersionValidator,
} as const;

export default extXVersion; 