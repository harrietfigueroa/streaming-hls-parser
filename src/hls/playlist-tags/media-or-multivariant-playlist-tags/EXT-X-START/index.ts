import { extXStartParser } from './parser';
import { extXStartStringifier } from './stringifier';
import { extXStartValidator, ExtXStartValidationResult } from './validator';
import {
    EXT_X_START_PARSED,
    EXT_X_START_STRING,
    ExtXStartValidationErrorUnion,
    EXTXSTARTNotObjectError,
    EXTXSTARTMissingTimeOffsetError,
    EXTXSTARTInvalidTimeOffsetError,
    EXTXSTARTInvalidPreciseError,
    PreciseValues,
    PreciseValue
} from './types';

export {
    extXStartParser,
    extXStartStringifier,
    extXStartValidator,
    ExtXStartValidationErrorUnion,
    ExtXStartValidationResult,
    EXTXSTARTNotObjectError,
    EXTXSTARTMissingTimeOffsetError,
    EXTXSTARTInvalidTimeOffsetError,
    EXTXSTARTInvalidPreciseError,
    EXT_X_START_PARSED,
    EXT_X_START_STRING,
    PreciseValues,
    PreciseValue,
};

export const extXStart = {
    kind: 'MediaOrMultivariant' as const,
    parser: extXStartParser,
    stringifier: extXStartStringifier,
    validator: extXStartValidator,
} as const;

export default extXStart; 