import { extXIndependentSegmentsParser } from './parser';
import { extXIndependentSegmentsStringifier } from './stringifier';
import { extXIndependentSegmentsValidator, ExtXIndependentSegmentsValidationResult } from './validator';
import {
    EXT_X_INDEPENDENT_SEGMENTS_PARSED,
    EXT_X_INDEPENDENT_SEGMENTS_STRING,
    ExtXIndependentSegmentsValidationErrorUnion,
    EXTXINDEPENDENTSEGMENTSNotBooleanError
} from './types';

export {
    extXIndependentSegmentsParser,
    extXIndependentSegmentsStringifier,
    extXIndependentSegmentsValidator,
    ExtXIndependentSegmentsValidationErrorUnion,
    ExtXIndependentSegmentsValidationResult,
    EXTXINDEPENDENTSEGMENTSNotBooleanError,
    EXT_X_INDEPENDENT_SEGMENTS_PARSED,
    EXT_X_INDEPENDENT_SEGMENTS_STRING,
};

export const extXIndependentSegments = {
    kind: 'MediaOrMultivariant' as const,
    parser: extXIndependentSegmentsParser,
    stringifier: extXIndependentSegmentsStringifier,
    validator: extXIndependentSegmentsValidator,
} as const;

export default extXIndependentSegments; 