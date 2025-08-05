import { extXKeyParser } from './parser';
import { extXKeyStringifier } from './stringifier';
import { extXKeyValidator, ExtXKeyValidationResult } from './validator';
import {
    EXT_X_KEY_PARSED,
    EXT_X_KEY_STRING,
    EXT_X_KEY_METHOD,
    EXT_X_KEY_METHOD_VALUES,
    ExtXKeyValidationErrorUnion,
    ExtXKeyNotAnObjectError,
    ExtXKeyMissingMethodError,
    ExtXKeyInvalidMethodError,
    ExtXKeyNoneWithAttributesError,
    ExtXKeyMissingUriError
} from './types';

export {
    extXKeyParser,
    extXKeyStringifier,
    extXKeyValidator,
    ExtXKeyValidationErrorUnion,
    ExtXKeyValidationResult,
    ExtXKeyNotAnObjectError,
    ExtXKeyMissingMethodError,
    ExtXKeyInvalidMethodError,
    ExtXKeyNoneWithAttributesError,
    ExtXKeyMissingUriError,
    EXT_X_KEY_PARSED,
    EXT_X_KEY_STRING,
    EXT_X_KEY_METHOD,
    EXT_X_KEY_METHOD_VALUES,
};

export const extXKey = {
    kind: 'segment' as const,
    parser: extXKeyParser,
    stringifier: extXKeyStringifier,
    validator: extXKeyValidator,
} as const;

export default extXKey; 