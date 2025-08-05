import { extinfParser } from './parser';
import { extinfStringifier } from './stringifier';
import { extinfValidator, ExtinfValidationResult } from './validator';
import {
    EXTINF_PARSED,
    EXTINF_STRING,
    ExtinfValidationErrorUnion,
    ExtinfNotAnObjectError,
    ExtinfMissingDurationError,
    ExtinfDurationNotANumberError,
    ExtinfDurationNegativeError,
    ExtinfTitleNotStringError
} from './types';

export {
    extinfParser,
    extinfStringifier,
    extinfValidator,
    ExtinfValidationErrorUnion,
    ExtinfValidationResult,
    ExtinfNotAnObjectError,
    ExtinfMissingDurationError,
    ExtinfDurationNotANumberError,
    ExtinfDurationNegativeError,
    ExtinfTitleNotStringError,
    EXTINF_PARSED,
    EXTINF_STRING,
};

export const extinf = {
    kind: 'segment' as const,
    parser: extinfParser,
    stringifier: extinfStringifier,
    validator: extinfValidator,
} as const;

export default extinf; 