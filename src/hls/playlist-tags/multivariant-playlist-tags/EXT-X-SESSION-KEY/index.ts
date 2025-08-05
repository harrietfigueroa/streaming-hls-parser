import { extXSessionKeyParser } from './parser';
import { extXSessionKeyStringifier } from './stringifier';
import { extXSessionKeyValidator } from './validator';
import {
    EXT_X_SESSION_KEY_PARSED,
    EXT_X_SESSION_KEY_STRING,
    ExtXSessionKeyValidationErrorUnion,
    ExtXSessionKeyValidationResult,
    ExtXSessionKeyMethodNoneError
} from './types';

export {
    extXSessionKeyParser,
    extXSessionKeyStringifier,
    extXSessionKeyValidator,
    ExtXSessionKeyValidationErrorUnion,
    ExtXSessionKeyValidationResult,
    ExtXSessionKeyMethodNoneError,
    EXT_X_SESSION_KEY_PARSED,
    EXT_X_SESSION_KEY_STRING,
};

export const extXSessionKey = {
    kind: 'MultivariantPlaylist' as const,
    parser: extXSessionKeyParser,
    stringifier: extXSessionKeyStringifier,
    validator: extXSessionKeyValidator,
} as const;

export default extXSessionKey; 