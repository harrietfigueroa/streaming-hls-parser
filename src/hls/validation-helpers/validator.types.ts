export interface ValidationError {
    type: string;
    invalidValue: any;
    description: string;
}

// Comprehensive type covering all validation error types across all validators
export type ValidationErrorType =
    // Integer-based validators (EXT-X-TARGETDURATION, EXT-X-MEDIA-SEQUENCE, EXT-X-DISCONTINUITY-SEQUENCE)
    | 'not-a-number'
    | 'not-an-integer'
    | 'negative-value'
    | 'exceeds-maximum'
    // Boolean-based validators (EXT-X-ENDLIST, EXT-X-I-FRAMES-ONLY)
    | 'not-a-boolean'
    // Enum-based validators (EXT-X-PLAYLIST-TYPE)
    | 'not-string-or-null'
    | 'invalid-enum-value'
    // Object-based validators (EXTINF, EXT-X-KEY, etc.)
    | 'not-an-object'
    | 'missing-duration'
    | 'duration-not-a-number'
    | 'duration-negative'
    | 'title-not-string'
    | 'missing-method'
    | 'invalid-method'
    | 'none-with-attributes'
    | 'missing-uri'
    // Date-based validators (EXT-X-PROGRAM-DATE-TIME)
    | 'not-a-date'
    | 'invalid-date'
    // Byte range validators (EXT-X-BYTERANGE)
    | 'missing-length'
    | 'length-not-a-number'
    | 'length-negative'
    | 'offset-not-a-number'
    | 'offset-negative';

export abstract class AbstractValidationError implements ValidationError {
    abstract readonly type: ValidationErrorType;
    abstract readonly invalidValue: any;
    abstract readonly description: string;

    toJSON(): ValidationError {
        return {
            type: this.type,
            invalidValue: this.invalidValue,
            description: this.description
        };
    }
}

export interface ValidationResult<TError extends ValidationError = ValidationError> {
    tagName: string;
    errors: TError[];
    isValid: boolean;
}

export interface Validator<T, TError extends ValidationError = ValidationError> {
    validate(value: T): ValidationResult<TError>;
} 