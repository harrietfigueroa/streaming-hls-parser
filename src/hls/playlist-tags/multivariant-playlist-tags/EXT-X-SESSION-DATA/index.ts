import { extXSessionDataParser } from './parser';
import { extXSessionDataStringifier } from './stringifier';
import { extXSessionDataValidator } from './validator';
import {
    EXT_X_SESSION_DATA_PARSED,
    EXT_X_SESSION_DATA_STRING,
    ExtXSessionDataValidationErrorUnion,
    ExtXSessionDataValidationResult,
    ExtXSessionDataDataIdRequiredError,
    ExtXSessionDataValueOrUriRequiredError
} from './types';

export {
    extXSessionDataParser,
    extXSessionDataStringifier,
    extXSessionDataValidator,
    ExtXSessionDataValidationErrorUnion,
    ExtXSessionDataValidationResult,
    ExtXSessionDataDataIdRequiredError,
    ExtXSessionDataValueOrUriRequiredError,
    EXT_X_SESSION_DATA_PARSED,
    EXT_X_SESSION_DATA_STRING,
};

export const extXSessionData = {
    kind: 'MultivariantPlaylist' as const,
    parser: extXSessionDataParser,
    stringifier: extXSessionDataStringifier,
    validator: extXSessionDataValidator,
} as const;

export default extXSessionData; 