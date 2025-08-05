import { extXMapParser } from './parser';
import { extXMapStringifier } from './stringifier';
import { extXMapValidator, ExtXMapValidationResult } from './validator';
import {
    EXT_X_MAP_PARSED,
    EXT_X_MAP_STRING,
    ExtXMapValidationErrorUnion,
    ExtXMapNotAnObjectError,
    ExtXMapMissingUriError,
    ExtXMapInvalidUriError,
    ExtXMapInvalidByteRangeError
} from './types';

export {
    extXMapParser,
    extXMapStringifier,
    extXMapValidator,
    ExtXMapValidationErrorUnion,
    ExtXMapValidationResult,
    ExtXMapNotAnObjectError,
    ExtXMapMissingUriError,
    ExtXMapInvalidUriError,
    ExtXMapInvalidByteRangeError,
    EXT_X_MAP_PARSED,
    EXT_X_MAP_STRING,
};

export const extXMap = {
    kind: 'segment' as const,
    parser: extXMapParser,
    stringifier: extXMapStringifier,
    validator: extXMapValidator,
} as const;

export default extXMap; 