import { describe, it, expect } from 'vitest';
import { extXDateRangeParser } from './parser';
import { extXDateRangeValidator } from './validator';
import {
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

describe('EXT-X-DATERANGE validator integration', () => {
    describe('parser-validator integration', () => {
        it('should validate parsed valid input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should validate parsed input with all attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400,SCTE35-CMD="test-cmd",SCTE35-OUT="test-out",SCTE35-IN="test-in"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should validate parsed input with END-ON-NEXT and CLASS', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should validate parsed input with matching END-DATE and DURATION', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });
    });

    describe('parser-validator error integration', () => {
        it('should detect missing ID in parsed input', () => {
            const input = '#EXT-X-DATERANGE:START-DATE="2023-01-01T00:00:00.000Z"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEIdRequiredError);
        });

        it('should detect missing START-DATE in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEStartDateRequiredError);
        });

        it('should detect invalid START-DATE in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="invalid-date"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidStartDateError);
        });

        it('should detect invalid END-DATE in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="invalid-date"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndDateError);
        });

        it('should detect negative PLANNED-DURATION in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",PLANNED-DURATION=-1';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidPlannedDurationError);
        });

        it('should detect zero PLANNED-DURATION in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",PLANNED-DURATION=0';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidPlannedDurationError);
        });

        it('should detect invalid END-ON-NEXT value in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",END-ON-NEXT=NO';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndOnNextError);
        });

        it('should detect END-ON-NEXT without CLASS in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEClassRequiredWithEndOnNextError);
        });

        it('should detect END-ON-NEXT with DURATION in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",DURATION=86400,END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndOnNextCombinationError);
        });

        it('should detect END-ON-NEXT with END-DATE in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndOnNextCombinationError);
        });

        it('should detect mismatched END-DATE and DURATION in parsed input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T01:00:00.000Z",DURATION=86400';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndDateDurationCombinationError);
        });
    });

    describe('multiple error integration', () => {
        it('should collect multiple errors from parsed input', () => {
            const input = '#EXT-X-DATERANGE:START-DATE="invalid-date",PLANNED-DURATION=-1';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(3);
            expect(validation.errors[0]).toBeInstanceOf(EXTXDATERANGEIdRequiredError);
            expect(validation.errors[1]).toBeInstanceOf(EXTXDATERANGEInvalidStartDateError);
            expect(validation.errors[2]).toBeInstanceOf(EXTXDATERANGEInvalidPlannedDurationError);
        });

        it('should handle complex error scenarios', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="invalid-date",END-DATE="invalid-date",DURATION=86400,END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);

            // Should have multiple errors including invalid dates and END-ON-NEXT issues
            const errorTypes = validation.errors.map(error => error.constructor.name);
            expect(errorTypes).toContain('EXTXDATERANGEInvalidStartDateError');
            expect(errorTypes).toContain('EXTXDATERANGEInvalidEndDateError');
            expect(errorTypes).toContain('EXTXDATERANGEClassRequiredWithEndOnNextError');
        });
    });

    describe('edge case integration', () => {
        it('should handle undefined parser result', () => {
            const input = '#EXT-X-DATERANGE:INVALID';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeUndefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should handle empty string input', () => {
            const parsed = extXDateRangeParser('');
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeUndefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should handle undefined input', () => {
            const parsed = extXDateRangeParser(undefined);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeUndefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });
    });

    describe('concrete error class integration', () => {
        it('should use concrete error classes in validation results', () => {
            const input = '#EXT-X-DATERANGE:START-DATE="2023-01-01T00:00:00.000Z"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);

            const error = validation.errors[0];
            expect(error).toBeInstanceOf(EXTXDATERANGEIdRequiredError);
            expect(error.tagName).toBe('#EXT-X-DATERANGE');
            expect(error.description).toContain('RFC 8216 Section 4.3.2.7');
        });

        it('should provide detailed error information', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="invalid-date"';
            const parsed = extXDateRangeParser(input);
            const validation = extXDateRangeValidator.validate(parsed!);

            expect(parsed).toBeDefined();
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveLength(1);

            const error = validation.errors[0];
            expect(error).toBeInstanceOf(EXTXDATERANGEInvalidStartDateError);
            expect(error.invalidValue).toBeDefined();
            expect(error.description).toContain('EXT-X-DATERANGE START-DATE must be a valid date');
            expect(error.description).toContain('RFC 8216 Section 4.3.2.7');
        });
    });
}); 