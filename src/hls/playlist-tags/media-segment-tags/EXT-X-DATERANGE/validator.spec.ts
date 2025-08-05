import { describe, it, expect } from 'vitest';
import { extXDateRangeValidator } from './validator';
import { EXT_X_DATERANGE_PARSED } from './types';
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

describe('EXT-X-DATERANGE validator', () => {
    describe('valid cases', () => {
        it('should validate basic EXT-X-DATERANGE with required attributes', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate EXT-X-DATERANGE with all optional attributes', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                CLASS: '"test-class"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'END-DATE': new Date('2023-01-02T00:00:00.000Z'),
                DURATION: 86400,
                'PLANNED-DURATION': 86400,
                'SCTE35-CMD': 'test-cmd',
                'SCTE35-OUT': 'test-out',
                'SCTE35-IN': 'test-in',
                'END-ON-NEXT': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate EXT-X-DATERANGE with END-ON-NEXT and CLASS', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                CLASS: '"test-class"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
                'END-ON-NEXT': 'YES',
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate EXT-X-DATERANGE with zero duration', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                DURATION: 0,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate EXT-X-DATERANGE with matching END-DATE and DURATION', () => {
            const startDate = new Date('2023-01-01T00:00:00.000Z');
            const duration = 86400; // 24 hours
            const endDate = new Date(startDate.getTime() + duration * 1000);

            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': startDate,
                'END-DATE': endDate,
                DURATION: duration,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('invalid cases', () => {
        it('should reject missing ID', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: undefined as any,
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEIdRequiredError);
        });

        it('should reject missing START-DATE', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': undefined as any,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEStartDateRequiredError);
        });

        it('should reject invalid START-DATE', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('invalid-date'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidStartDateError);
        });

        it('should reject invalid END-DATE', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'END-DATE': new Date('invalid-date'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndDateError);
        });

        it('should reject negative PLANNED-DURATION', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'PLANNED-DURATION': -1,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidPlannedDurationError);
        });

        it('should reject zero PLANNED-DURATION', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'PLANNED-DURATION': 0,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidPlannedDurationError);
        });

        it('should reject invalid END-ON-NEXT value', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
                'END-ON-NEXT': 'NO' as any,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndOnNextError);
        });

        it('should reject END-ON-NEXT without CLASS', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
                'END-ON-NEXT': 'YES',
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEClassRequiredWithEndOnNextError);
        });

        it('should reject END-ON-NEXT with DURATION', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                CLASS: '"test-class"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                DURATION: 86400,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
                'END-ON-NEXT': 'YES',
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndOnNextCombinationError);
        });

        it('should reject END-ON-NEXT with END-DATE', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                CLASS: '"test-class"',
                'START-DATE': new Date('2023-01-01T00:00:00.000Z'),
                'END-DATE': new Date('2023-01-02T00:00:00.000Z'),
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
                'END-ON-NEXT': 'YES',
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndOnNextCombinationError);
        });

        it('should reject mismatched END-DATE and DURATION', () => {
            const startDate = new Date('2023-01-01T00:00:00.000Z');
            const duration = 86400; // 24 hours
            const endDate = new Date(startDate.getTime() + (duration + 3600) * 1000); // 1 hour later

            const input: EXT_X_DATERANGE_PARSED = {
                ID: '"test-id"',
                'START-DATE': startDate,
                'END-DATE': endDate,
                DURATION: duration,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEInvalidEndDateDurationCombinationError);
        });
    });

    describe('multiple errors', () => {
        it('should collect multiple validation errors', () => {
            const input: EXT_X_DATERANGE_PARSED = {
                ID: undefined as any,
                'START-DATE': undefined as any,
                'PLANNED-DURATION': -1,
                'SCTE35-CMD': undefined,
                'SCTE35-OUT': undefined,
                'SCTE35-IN': undefined,
            };

            const result = extXDateRangeValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(3);
            expect(result.errors[0]).toBeInstanceOf(EXTXDATERANGEIdRequiredError);
            expect(result.errors[1]).toBeInstanceOf(EXTXDATERANGEStartDateRequiredError);
            expect(result.errors[2]).toBeInstanceOf(EXTXDATERANGEInvalidPlannedDurationError);
        });
    });

    describe('null/undefined handling', () => {
        it('should handle null input', () => {
            const result = extXDateRangeValidator.validate(null as any);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle undefined input', () => {
            const result = extXDateRangeValidator.validate(undefined as any);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
}); 