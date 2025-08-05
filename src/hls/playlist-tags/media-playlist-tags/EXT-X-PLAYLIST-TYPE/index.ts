import { extXPlaylistTypeParser } from './parser';
import { extXPlaylistTypeStringifier } from './stringifier';
import { extXPlaylistTypeValidator, ExtXPlaylistTypeValidationResult } from './validator';
import {
    EXT_X_PLAYLIST_TYPE_PARSED,
    EXT_X_PLAYLIST_TYPE_STRING,
    ExtXPlaylistTypeValidationErrorUnion,
    EXTXPLAYLISTTYPENotStringOrNullError,
    EXTXPLAYLISTTYPEInvalidEnumValueError
} from './types';

export {
    extXPlaylistTypeParser,
    extXPlaylistTypeStringifier,
    extXPlaylistTypeValidator,
    ExtXPlaylistTypeValidationErrorUnion,
    ExtXPlaylistTypeValidationResult,
    EXTXPLAYLISTTYPENotStringOrNullError,
    EXTXPLAYLISTTYPEInvalidEnumValueError,
    EXT_X_PLAYLIST_TYPE_PARSED,
    EXT_X_PLAYLIST_TYPE_STRING,
};

export const extXPlaylistType = {
    kind: 'MediaPlaylist' as const,
    parser: extXPlaylistTypeParser,
    stringifier: extXPlaylistTypeStringifier,
    validator: extXPlaylistTypeValidator,
} as const;

export default extXPlaylistType; 