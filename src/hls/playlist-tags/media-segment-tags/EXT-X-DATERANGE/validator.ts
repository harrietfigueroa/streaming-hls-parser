import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_DATERANGE_PARSED,
    ExtXDateRangeValidationErrorUnion,
    EXTXDATERANGEIdRequiredError,
    EXTXDATERANGEStartDateRequiredError,
    EXTXDATERANGEInvalidStartDateError,
    EXTXDATERANGEInvalidEndDateError,
    EXTXDATERANGEInvalidPlannedDurationError,
    EXTXDATERANGEInvalidEndOnNextError,
    EXTXDATERANGEClassRequiredWithEndOnNextError,
    EXTXDATERANGEInvalidEndOnNextCombinationError,
    EXTXDATERANGEInvalidEndDateDurationCombinationError
} from './types';

export interface ExtXDateRangeValidationResult extends ValidationResult<ExtXDateRangeValidationErrorUnion> {
    tagName: '#EXT-X-DATERANGE';
}

/**
 * Validates EXT-X-DATERANGE values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.7:
 * - The EXT-X-DATERANGE tag associates a Date Range with a set of
 *   attributes and their associated value semantics.
 * - Its format is: #EXT-X-DATERANGE:<attribute-list>
 */
export class ExtXDateRangeValidator implements Validator<EXT_X_DATERANGE_PARSED, ExtXDateRangeValidationErrorUnion> {
    validate(value: EXT_X_DATERANGE_PARSED): ExtXDateRangeValidationResult {
        const errors: ExtXDateRangeValidationErrorUnion[] = [];

        if (!value) {
            return {
                tagName: '#EXT-X-DATERANGE',
                errors,
                isValid: true
            };
        }

        // ID is required
        if (!value.ID) {
            errors.push(new EXTXDATERANGEIdRequiredError(value));
        }

        // START-DATE is required
        if (!value['START-DATE']) {
            errors.push(new EXTXDATERANGEStartDateRequiredError(value));
        }

        // START-DATE must be a valid date
        if (value['START-DATE'] && isNaN(value['START-DATE'].getTime())) {
            errors.push(new EXTXDATERANGEInvalidStartDateError(value));
        }

        // END-DATE is optional but MUST be a valid date if present
        if (value['END-DATE'] && isNaN(value['END-DATE'].getTime())) {
            errors.push(new EXTXDATERANGEInvalidEndDateError(value));
        }

        // PLANNED-DURATION must be positive
        if (value['PLANNED-DURATION'] !== undefined && value['PLANNED-DURATION'] <= 0) {
            errors.push(new EXTXDATERANGEInvalidPlannedDurationError(value));
        }

        // END-ON-NEXT must be YES if present
        if (value['END-ON-NEXT'] && value['END-ON-NEXT'] !== 'YES') {
            errors.push(new EXTXDATERANGEInvalidEndOnNextError(value));
        }

        // If END-ON-NEXT is present then CLASS is required
        if (value['END-ON-NEXT'] === 'YES' && !value.CLASS) {
            errors.push(new EXTXDATERANGEClassRequiredWithEndOnNextError(value));
        }

        // If END-ON-NEXT is present then DURATION and END-DATE are not allowed
        if (value['END-ON-NEXT'] === 'YES' && (value.DURATION || value['END-DATE'])) {
            errors.push(new EXTXDATERANGEInvalidEndOnNextCombinationError(value));
        }

        // If END-DATE and DURATION are present then END-DATE must equal START-DATE + DURATION
        if (value['END-DATE'] && value.DURATION) {
            const startDate = value['START-DATE'];
            const calculatedEndDate = new Date(startDate.getTime() + value.DURATION * 1000);
            const providedEndDate = value['END-DATE'];
            if (calculatedEndDate.getTime() !== providedEndDate.getTime()) {
                errors.push(new EXTXDATERANGEInvalidEndDateDurationCombinationError(value));
            }
        }

        return {
            tagName: '#EXT-X-DATERANGE',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXDateRangeValidator = new ExtXDateRangeValidator(); 