import { describe, it, expect } from 'vitest';
import { dateParse } from './date-parse';

describe('dateParse', () => {
    describe('valid ISO 8601 date strings', () => {
        it('should parse full ISO 8601 format with timezone', () => {
            const result = dateParse('2010-02-19T14:54:23.031+08:00');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2010-02-19T06:54:23.031Z');
        });

        it('should parse ISO 8601 format with UTC timezone', () => {
            const result = dateParse('2010-02-19T14:54:23.031Z');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2010-02-19T14:54:23.031Z');
        });

        it('should parse ISO 8601 format with negative timezone offset', () => {
            const result = dateParse('2010-02-19T14:54:23.031-05:00');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2010-02-19T19:54:23.031Z');
        });

        it('should parse ISO 8601 format without milliseconds', () => {
            const result = dateParse('2010-02-19T14:54:23Z');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2010-02-19T14:54:23.000Z');
        });

        it('should parse ISO 8601 format without timezone (assumes local)', () => {
            const result = dateParse('2010-02-19T14:54:23.031');
            expect(result).toBeInstanceOf(Date);
            // Note: The exact ISO string will depend on the local timezone
            expect(result).not.toBeNull();
        });

        it('should parse ISO 8601 format with timezone offset without milliseconds', () => {
            const result = dateParse('2010-02-19T14:54:23+08:00');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2010-02-19T06:54:23.000Z');
        });
    });

    describe('invalid inputs', () => {
        it('should return undefined for undefined input', () => {
            const result = dateParse(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined for null input', () => {
            const result = dateParse(null as any);
            expect(result).toBeUndefined();
        });

        it('should return undefined for empty string', () => {
            const result = dateParse('');
            expect(result).toBeUndefined();
        });

        it('should return undefined for invalid date string', () => {
            const result = dateParse('invalid-date');
            expect(result).toBeUndefined();
        });

        it('should return undefined for malformed date string', () => {
            const result = dateParse('2010-13-45T25:70:99.999Z');
            expect(result).toBeUndefined();
        });

        it('should return undefined for non-string input', () => {
            const result = dateParse(123 as any);
            expect(result).toBeUndefined();
        });

        it('should return undefined for object input', () => {
            const result = dateParse({} as any);
            expect(result).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        it('should handle leap year dates', () => {
            const result = dateParse('2020-02-29T12:00:00.000Z');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2020-02-29T12:00:00.000Z');
        });

        it('should handle end of year dates', () => {
            const result = dateParse('2023-12-31T23:59:59.999Z');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2023-12-31T23:59:59.999Z');
        });

        it('should handle start of year dates', () => {
            const result = dateParse('2023-01-01T00:00:00.000Z');
            expect(result).toBeInstanceOf(Date);
            expect(result?.toISOString()).toBe('2023-01-01T00:00:00.000Z');
        });

        it('should handle dates with different millisecond precisions', () => {
            const result1 = dateParse('2023-01-01T12:00:00.1Z');
            const result2 = dateParse('2023-01-01T12:00:00.12Z');
            const result3 = dateParse('2023-01-01T12:00:00.123Z');

            expect(result1).toBeInstanceOf(Date);
            expect(result2).toBeInstanceOf(Date);
            expect(result3).toBeInstanceOf(Date);
        });
    });
}); 