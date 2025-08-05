import { extXMediaSequenceParser } from './parser';
import { extXMediaSequenceStringifier } from './stringifier';
import { extXMediaSequenceValidator, ExtXMediaSequenceValidationResult } from './validator';
import {
    EXT_X_MEDIA_SEQUENCE_PARSED,
    EXT_X_MEDIA_SEQUENCE_STRING,
    ExtXMediaSequenceValidationErrorUnion,
    ExtXMediaSequenceNotANumberError,
    ExtXMediaSequenceNotAnIntegerError,
    ExtXMediaSequenceNegativeValueError,
    ExtXMediaSequenceExceedsMaximumError
} from './types';

export {
    extXMediaSequenceParser,
    extXMediaSequenceStringifier,
    extXMediaSequenceValidator,
    ExtXMediaSequenceValidationErrorUnion,
    ExtXMediaSequenceValidationResult,
    ExtXMediaSequenceNotANumberError,
    ExtXMediaSequenceNotAnIntegerError,
    ExtXMediaSequenceNegativeValueError,
    ExtXMediaSequenceExceedsMaximumError,
    EXT_X_MEDIA_SEQUENCE_PARSED,
    EXT_X_MEDIA_SEQUENCE_STRING,
};

export const extXMediaSequence = {
    kind: 'MediaPlaylist' as const,
    parser: extXMediaSequenceParser,
    stringifier: extXMediaSequenceStringifier,
    validator: extXMediaSequenceValidator,
} as const;

export default extXMediaSequence; 