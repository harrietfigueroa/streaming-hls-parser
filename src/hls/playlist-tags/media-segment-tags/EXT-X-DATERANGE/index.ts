import { extXDateRangeParser } from './parser';
import { extXDateRangeStringifier } from './stringifier';
import { extXDateRangeValidator, ExtXDateRangeValidationResult } from './validator';
import {
    EXT_X_DATERANGE_PARSED,
    EXT_X_DATERANGE_STRING,
    ExtXDateRangeValidationErrorUnion,
    EXTXDATERANGEIdRequiredError,
    EXTXDATERANGEStartDateRequiredError,
    EXTXDATERANGEInvalidStartDateError,
    EXTXDATERANGEInvalidEndDateError,
    EXTXDATERANGEInvalidPlannedDurationError,
    EXTXDATERANGEInvalidEndOnNextError,
    EXTXDATERANGEClassRequiredWithEndOnNextError,
    EXTXDATERANGEInvalidEndOnNextCombinationError,
    EXTXDATERANGEInvalidEndDateDurationCombinationError,
} from './types';

// Export all components
export {
    extXDateRangeParser,
    extXDateRangeStringifier,
    extXDateRangeValidator,
    EXT_X_DATERANGE_PARSED,
    EXT_X_DATERANGE_STRING,
    ExtXDateRangeValidationErrorUnion,
    ExtXDateRangeValidationResult,
    EXTXDATERANGEIdRequiredError,
    EXTXDATERANGEStartDateRequiredError,
    EXTXDATERANGEInvalidStartDateError,
    EXTXDATERANGEInvalidEndDateError,
    EXTXDATERANGEInvalidPlannedDurationError,
    EXTXDATERANGEInvalidEndOnNextError,
    EXTXDATERANGEClassRequiredWithEndOnNextError,
    EXTXDATERANGEInvalidEndOnNextCombinationError,
    EXTXDATERANGEInvalidEndDateDurationCombinationError,
};

// Export default tag object
export const extXDateRange = {
    kind: 'MediaSegment' as const,
    parser: extXDateRangeParser,
    stringifier: extXDateRangeStringifier,
    validator: extXDateRangeValidator,
} as const;

export default extXDateRange; 