import { extXDiscontinuityParser } from './parser';
import { extXDiscontinuityStringifier } from './stringifier';
import { extXDiscontinuityValidator, ExtXDiscontinuityValidationResult } from './validator';
import {
    EXT_X_DISCONTINUITY_PARSED,
    EXT_X_DISCONTINUITY_STRING,
    ExtXDiscontinuityValidationErrorUnion,
    EXTXDISCONTINUITYNotABooleanError
} from './types';

export {
    extXDiscontinuityParser,
    extXDiscontinuityStringifier,
    extXDiscontinuityValidator,
    ExtXDiscontinuityValidationErrorUnion,
    ExtXDiscontinuityValidationResult,
    EXTXDISCONTINUITYNotABooleanError,
    EXT_X_DISCONTINUITY_PARSED,
    EXT_X_DISCONTINUITY_STRING,
};

export const extXDiscontinuity = {
    kind: 'MediaSegment' as const,
    parser: extXDiscontinuityParser,
    stringifier: extXDiscontinuityStringifier,
    validator: extXDiscontinuityValidator,
} as const;

export default extXDiscontinuity; 