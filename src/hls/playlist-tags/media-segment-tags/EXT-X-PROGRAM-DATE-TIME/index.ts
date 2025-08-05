import { extXProgramDateTimeParser } from './parser';
import { extXProgramDateTimeStringifier } from './stringifier';
import { extXProgramDateTimeValidator, ExtXProgramDateTimeValidationResult } from './validator';
import {
    EXT_X_PROGRAM_DATE_TIME_PARSED,
    EXT_X_PROGRAM_DATE_TIME_STRING,
    ExtXProgramDateTimeValidationErrorUnion,
    ExtXProgramDateTimeNotADateError,
    ExtXProgramDateTimeInvalidDateError
} from './types';

export {
    extXProgramDateTimeParser,
    extXProgramDateTimeStringifier,
    extXProgramDateTimeValidator,
    ExtXProgramDateTimeValidationErrorUnion,
    ExtXProgramDateTimeValidationResult,
    ExtXProgramDateTimeNotADateError,
    ExtXProgramDateTimeInvalidDateError,
    EXT_X_PROGRAM_DATE_TIME_PARSED,
    EXT_X_PROGRAM_DATE_TIME_STRING,
};

export const extXProgramDateTime = {
    kind: 'segment' as const,
    parser: extXProgramDateTimeParser,
    stringifier: extXProgramDateTimeStringifier,
    validator: extXProgramDateTimeValidator,
} as const;

export default extXProgramDateTime; 