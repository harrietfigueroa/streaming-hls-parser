import { extXDiscontinuitySequenceParser } from './parser';
import { extXDiscontinuitySequenceStringifier } from './stringifier';
import { extXDiscontinuitySequenceValidator, ExtXDiscontinuitySequenceValidationResult } from './validator';
import {
    EXT_X_DISCONTINUITY_SEQUENCE_PARSED,
    EXT_X_DISCONTINUITY_SEQUENCE_STRING,
    ExtXDiscontinuitySequenceValidationErrorUnion,
    EXTXDISCONTINUITYSEQUENCENotANumberError,
    EXTXDISCONTINUITYSEQUENCENotAnIntegerError,
    EXTXDISCONTINUITYSEQUENCENegativeValueError,
    EXTXDISCONTINUITYSEQUENCEExceedsMaximumError
} from './types';

export {
    extXDiscontinuitySequenceParser,
    extXDiscontinuitySequenceStringifier,
    extXDiscontinuitySequenceValidator,
    ExtXDiscontinuitySequenceValidationErrorUnion,
    ExtXDiscontinuitySequenceValidationResult,
    EXTXDISCONTINUITYSEQUENCENotANumberError,
    EXTXDISCONTINUITYSEQUENCENotAnIntegerError,
    EXTXDISCONTINUITYSEQUENCENegativeValueError,
    EXTXDISCONTINUITYSEQUENCEExceedsMaximumError,
    EXT_X_DISCONTINUITY_SEQUENCE_PARSED,
    EXT_X_DISCONTINUITY_SEQUENCE_STRING,
};

export const extXDiscontinuitySequence = {
    kind: 'MediaPlaylist' as const,
    parser: extXDiscontinuitySequenceParser,
    stringifier: extXDiscontinuitySequenceStringifier,
    validator: extXDiscontinuitySequenceValidator,
} as const;

export default extXDiscontinuitySequence; 