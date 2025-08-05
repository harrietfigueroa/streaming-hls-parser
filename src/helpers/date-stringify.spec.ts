import { describe, it, expect } from 'vitest';
import { dateStringify, dateStringifyWithPrecision } from './date-stringify';

describe('dateStringify', () => {
    describe('valid Date objects', () => {
        it('should stringify Date to ISO 8601 format', () => {
            const date = new Date('2023-01-01T12:00:00.000Z');
            const result = dateStringify(date);
            expect(result).toBe('2023-01-01T12:00:00.000Z');
        });

        it('should stringify Date with milliseconds', () => {
            const date = new Date('2023-01-01T12:00:00.123Z');
            const result = dateStringify(date);
            expect(result).toBe('2023-01-01T12:00:00.123Z');
        });

        it('should stringify Date with different timezone', () => {
            const date = new Date('2023-01-01T12:00:00.000+08:00');
            const result = dateStringify(date);
            // Should convert to UTC
            expect(result).toBe('2023-01-01T04:00:00.000Z');
        });

        it('should stringify Date with negative timezone', () => {
            const date = new Date('2023-01-01T12:00:00.000-05:00');
            const result = dateStringify(date);
            // Should convert to UTC
            expect(result).toBe('2023-01-01T17:00:00.000Z');
        });

        it('should stringify leap year date', () => {
            const date = new Date('2020-02-29T12:00:00.000Z');
            const result = dateStringify(date);
            expect(result).toBe('2020-02-29T12:00:00.000Z');
        });

        it('should stringify end of year date', () => {
            const date = new Date('2023-12-31T23:59:59.999Z');
            const result = dateStringify(date);
            expect(result).toBe('2023-12-31T23:59:59.999Z');
        });
    });

    describe('invalid inputs', () => {
        it('should return undefined for undefined input', () => {
            const result = dateStringify(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined for null input', () => {
            const result = dateStringify(null as any);
            expect(result).toBeUndefined();
        });

        it('should return undefined for invalid Date', () => {
            const invalidDate = new Date('invalid-date');
            const result = dateStringify(invalidDate);
            expect(result).toBeUndefined();
        });

        it('should return undefined for non-Date input', () => {
            const result = dateStringify('2023-01-01' as any);
            expect(result).toBeUndefined();
        });

        it('should return undefined for number input', () => {
            const result = dateStringify(123 as any);
            expect(result).toBeUndefined();
        });

        it('should return undefined for object input', () => {
            const result = dateStringify({} as any);
            expect(result).toBeUndefined();
        });
    });
});

describe('dateStringifyWithPrecision', () => {
    describe('with milliseconds (default)', () => {
        it('should stringify Date with milliseconds when includeMilliseconds is true', () => {
            const date = new Date('2023-01-01T12:00:00.123Z');
            const result = dateStringifyWithPrecision(date, true);
            expect(result).toBe('2023-01-01T12:00:00.123Z');
        });

        it('should stringify Date with milliseconds when includeMilliseconds is not specified', () => {
            const date = new Date('2023-01-01T12:00:00.123Z');
            const result = dateStringifyWithPrecision(date);
            expect(result).toBe('2023-01-01T12:00:00.123Z');
        });
    });

    describe('without milliseconds', () => {
        it('should stringify Date without milliseconds when includeMilliseconds is false', () => {
            const date = new Date('2023-01-01T12:00:00.123Z');
            const result = dateStringifyWithPrecision(date, false);
            expect(result).toBe('2023-01-01T12:00:00Z');
        });

        it('should stringify Date without milliseconds for date with zero milliseconds', () => {
            const date = new Date('2023-01-01T12:00:00.000Z');
            const result = dateStringifyWithPrecision(date, false);
            expect(result).toBe('2023-01-01T12:00:00Z');
        });

        it('should stringify Date without milliseconds for date with non-zero milliseconds', () => {
            const date = new Date('2023-01-01T12:00:00.999Z');
            const result = dateStringifyWithPrecision(date, false);
            expect(result).toBe('2023-01-01T12:00:00Z');
        });
    });

    describe('invalid inputs', () => {
        it('should return undefined for undefined input', () => {
            const result = dateStringifyWithPrecision(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined for null input', () => {
            const result = dateStringifyWithPrecision(null as any);
            expect(result).toBeUndefined();
        });

        it('should return undefined for invalid Date', () => {
            const invalidDate = new Date('invalid-date');
            const result = dateStringifyWithPrecision(invalidDate);
            expect(result).toBeUndefined();
        });

        it('should return undefined for non-Date input', () => {
            const result = dateStringifyWithPrecision('2023-01-01' as any);
            expect(result).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        it('should handle dates with different millisecond precisions', () => {
            const date1 = new Date('2023-01-01T12:00:00.1Z');
            const date2 = new Date('2023-01-01T12:00:00.12Z');
            const date3 = new Date('2023-01-01T12:00:00.123Z');

            expect(dateStringifyWithPrecision(date1, false)).toBe('2023-01-01T12:00:00Z');
            expect(dateStringifyWithPrecision(date2, false)).toBe('2023-01-01T12:00:00Z');
            expect(dateStringifyWithPrecision(date3, false)).toBe('2023-01-01T12:00:00Z');
        });

        it('should handle dates with different timezones', () => {
            const date1 = new Date('2023-01-01T12:00:00.000+08:00');
            const date2 = new Date('2023-01-01T12:00:00.000-05:00');

            expect(dateStringifyWithPrecision(date1, false)).toBe('2023-01-01T04:00:00Z');
            expect(dateStringifyWithPrecision(date2, false)).toBe('2023-01-01T17:00:00Z');
        });
    });
}); 