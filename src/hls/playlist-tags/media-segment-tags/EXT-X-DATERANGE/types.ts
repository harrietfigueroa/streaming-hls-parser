import { numberfy } from '../../../../helpers/numberfy';
import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { isDefined } from '../../../../helpers/isDefined';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import {
    AttributeDecimalFloatingPointValue,
    AttributeHexValue,
    AttributeQuotedString,
} from '../../../parse-helpers/attribute-list';
import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

/**
 * The EXT-X-DATERANGE tag associates a Date Range with a set of
 * attributes and their associated value semantics.
 *
 * RFC 8216 Section 4.3.2.7:
 * - The EXT-X-DATERANGE tag associates a Date Range with a set of
 *   attributes and their associated value semantics.
 * - Its format is: #EXT-X-DATERANGE:<attribute-list>
 */
export interface EXT_X_DATERANGE_PARSED {
    /**
     * A quoted-string that uniquely identifies a Date Range in the
     * Playlist. This attribute is REQUIRED.
     */
    ID: string;

    /**
     * A client-defined quoted-string that specifies some set of
     * attributes and their associated value semantics. All Date Ranges
     * with the same CLASS attribute value MUST adhere to these
     * semantics. This attribute is OPTIONAL.
     */
    CLASS?: string;

    /**
     * A quoted-string containing the ISO-8601 date at which the Date
     * Range begins. This attribute is REQUIRED.
     */
    'START-DATE': Date;

    /**
     * A quoted-string containing the ISO-8601 date at which the Date
     * Range ends. It MUST be equal to or later than the value of the
     * START-DATE attribute. This attribute is OPTIONAL.
     */
    'END-DATE'?: Date;

    /**
     * The duration of the Date Range expressed as a decimal-floating-
     * point number of seconds. It MUST NOT be negative. A single
     * instant in time (e.g., crossing a finish line) SHOULD be
     * represented with a duration of 0. This attribute is OPTIONAL.
     */
    DURATION?: number;

    /**
     * The expected duration of the Date Range expressed as a decimal-
     * floating-point number of seconds. It MUST NOT be negative. This
     * attribute SHOULD be used to indicate the expected duration of a
     * Date Range whose actual duration is not yet known. It is
     * OPTIONAL.
     */
    'PLANNED-DURATION'?: number;

    /**
     * The "X-" prefix defines a namespace reserved for client-defined
     * attributes. The client-attribute MUST be a legal AttributeName.
     * Clients SHOULD use a reverse-DNS syntax when defining their own
     * attribute names to avoid collisions. The attribute value MUST be
     * a quoted-string, a hexadecimal-sequence, or a decimal-floating-
     * point. An example of a client-defined attribute is X-COM-EXAMPLE-
     * AD-ID="XYZ123". These attributes are OPTIONAL.
     */
    [clientAttribute: `X-${string}`]:
    | AttributeQuotedString
    | AttributeHexValue
    | AttributeDecimalFloatingPointValue;

    /**
     * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
     * information. These attributes are OPTIONAL.
     */
    'SCTE35-CMD': any;

    /**
     * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
     * information. These attributes are OPTIONAL.
     */
    'SCTE35-OUT': any;

    /**
     * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
     * information. These attributes are OPTIONAL.
     */
    'SCTE35-IN': any;

    /**
     * An enumerated-string whose value MUST be YES. This attribute
     * indicates that the end of the range containing it is equal to the
     * START-DATE of its Following Range. The Following Range is the
     * Date Range of the same CLASS that has the earliest START-DATE
     * after the START-DATE of the range in question. This attribute is
     * OPTIONAL.
     */
    'END-ON-NEXT'?: 'YES';
}

export type EXT_X_DATERANGE_STRING = `#EXT-X-DATERANGE:${string}`;

// Abstract validation error class for this tag
export abstract class ExtXDateRangeValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-DATERANGE';
}

// Concrete validation error classes
export class EXTXDATERANGEIdRequiredError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'missing-uri';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE ID attribute is required (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEStartDateRequiredError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'missing-uri';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE START-DATE attribute is required (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEInvalidStartDateError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'invalid-date';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE START-DATE must be a valid date (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEInvalidEndDateError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'invalid-date';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE END-DATE must be a valid date (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEInvalidPlannedDurationError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'duration-negative';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE PLANNED-DURATION must be positive (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEInvalidEndOnNextError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'invalid-enum-value';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE END-ON-NEXT must be YES if present (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEClassRequiredWithEndOnNextError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'missing-uri';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE CLASS is required if END-ON-NEXT is present (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEInvalidEndOnNextCombinationError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'none-with-attributes';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE DURATION and END-DATE are not allowed if END-ON-NEXT is present (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class EXTXDATERANGEInvalidEndDateDurationCombinationError extends ExtXDateRangeValidationError {
    readonly type: ValidationErrorType = 'none-with-attributes';
    readonly tagName = '#EXT-X-DATERANGE';
    readonly description = 'EXT-X-DATERANGE END-DATE must equal START-DATE + DURATION (RFC 8216 Section 4.3.2.7: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtXDateRangeValidationErrorUnion =
    | EXTXDATERANGEIdRequiredError
    | EXTXDATERANGEStartDateRequiredError
    | EXTXDATERANGEInvalidStartDateError
    | EXTXDATERANGEInvalidEndDateError
    | EXTXDATERANGEInvalidPlannedDurationError
    | EXTXDATERANGEInvalidEndOnNextError
    | EXTXDATERANGEClassRequiredWithEndOnNextError
    | EXTXDATERANGEInvalidEndOnNextCombinationError
    | EXTXDATERANGEInvalidEndDateDurationCombinationError; 