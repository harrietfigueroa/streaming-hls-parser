import { extXByteRangeParser } from './parser';
import { extXByteRangeStringifier } from './stringifier';
import { extXByteRangeValidator, ExtXByteRangeValidationResult } from './validator';
import {
    EXT_X_BYTERANGE_PARSED,
    EXT_X_BYTERANGE_STRING,
    EXT_X_BYTE_RANGE_STRING_VALUE,
    EXT_X_BYTERANGE_SINGLE_PARAM,
    EXT_X_BYTERANGE_DOUBLE_PARAM,
    ExtXByteRangeValidationErrorUnion,
    ExtXByteRangeNotAnObjectError,
    ExtXByteRangeMissingLengthError,
    ExtXByteRangeLengthNotANumberError,
    ExtXByteRangeLengthNegativeError,
    ExtXByteRangeOffsetNotANumberError,
    ExtXByteRangeOffsetNegativeError
} from './types';

export {
    extXByteRangeParser,
    extXByteRangeStringifier,
    extXByteRangeValidator,
    ExtXByteRangeValidationErrorUnion,
    ExtXByteRangeValidationResult,
    ExtXByteRangeNotAnObjectError,
    ExtXByteRangeMissingLengthError,
    ExtXByteRangeLengthNotANumberError,
    ExtXByteRangeLengthNegativeError,
    ExtXByteRangeOffsetNotANumberError,
    ExtXByteRangeOffsetNegativeError,
    EXT_X_BYTERANGE_PARSED,
    EXT_X_BYTERANGE_STRING,
    EXT_X_BYTE_RANGE_STRING_VALUE,
    EXT_X_BYTERANGE_SINGLE_PARAM,
    EXT_X_BYTERANGE_DOUBLE_PARAM,
};

export const extXByteRange = {
    kind: 'segment' as const,
    parser: extXByteRangeParser,
    stringifier: extXByteRangeStringifier,
    validator: extXByteRangeValidator,
} as const;

export default extXByteRange; 