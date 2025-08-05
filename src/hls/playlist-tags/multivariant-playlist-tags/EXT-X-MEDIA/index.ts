import { extXMediaParser } from './parser';
import { extXMediaStringifier } from './stringifier';
import { extXMediaValidator } from './validator';
import {
    EXT_X_MEDIA_PARSED,
    EXT_X_MEDIA_STRING,
    ExtXMediaValidationErrorUnion,
    ExtXMediaValidationResult,
    ExtXMediaTypeRequiredError,
    ExtXMediaUriNotAllowedError,
    ExtXMediaGroupIdRequiredError,
    ExtXMediaNameRequiredError,
    ExtXMediaAutoselectRequiredError,
    ExtXMediaForcedNotAllowedError,
    ExtXMediaInstreamIdRequiredError,
    ExtXMediaInstreamIdInvalidError,
    ExtXMediaInstreamIdNotAllowedError
} from './types';

export {
    extXMediaParser,
    extXMediaStringifier,
    extXMediaValidator,
    ExtXMediaValidationErrorUnion,
    ExtXMediaValidationResult,
    ExtXMediaTypeRequiredError,
    ExtXMediaUriNotAllowedError,
    ExtXMediaGroupIdRequiredError,
    ExtXMediaNameRequiredError,
    ExtXMediaAutoselectRequiredError,
    ExtXMediaForcedNotAllowedError,
    ExtXMediaInstreamIdRequiredError,
    ExtXMediaInstreamIdInvalidError,
    ExtXMediaInstreamIdNotAllowedError,
    EXT_X_MEDIA_PARSED,
    EXT_X_MEDIA_STRING,
};

export const extXMedia = {
    kind: 'MultivariantPlaylist' as const,
    parser: extXMediaParser,
    stringifier: extXMediaStringifier,
    validator: extXMediaValidator,
} as const;

export default extXMedia; 