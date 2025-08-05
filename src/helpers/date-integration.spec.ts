import { describe, it, expect } from 'vitest';
import { dateParse } from './date-parse';
import { dateStringify, dateStringifyWithPrecision } from './date-stringify';

describe('Date helpers integration', () => {
    describe('parse and stringify round-trip', () => {
        it('should maintain date integrity through parse-stringify round-trip', () => {
            const originalDateString = '2023-01-01T12:00:00.123Z';

            // Parse the date string
            const parsedDate = dateParse(originalDateString);
            expect(parsedDate).toBeInstanceOf(Date);

            // Stringify the parsed date
            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBe(originalDateString);
        });

        it('should handle timezone conversions correctly', () => {
            const originalDateString = '2023-01-01T12:00:00.000+08:00';

            // Parse the date string (should convert to UTC)
            const parsedDate = dateParse(originalDateString);
            expect(parsedDate).toBeInstanceOf(Date);

            // Stringify should return UTC format
            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBe('2023-01-01T04:00:00.000Z');
        });

        it('should handle negative timezone offsets', () => {
            const originalDateString = '2023-01-01T12:00:00.000-05:00';

            // Parse the date string (should convert to UTC)
            const parsedDate = dateParse(originalDateString);
            expect(parsedDate).toBeInstanceOf(Date);

            // Stringify should return UTC format
            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBe('2023-01-01T17:00:00.000Z');
        });

        it('should handle dates without milliseconds', () => {
            const originalDateString = '2023-01-01T12:00:00Z';

            // Parse the date string
            const parsedDate = dateParse(originalDateString);
            expect(parsedDate).toBeInstanceOf(Date);

            // Stringify should add milliseconds
            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBe('2023-01-01T12:00:00.000Z');
        });
    });

    describe('precision control', () => {
        it('should stringify with milliseconds by default', () => {
            const date = new Date('2023-01-01T12:00:00.123Z');
            const result = dateStringifyWithPrecision(date);
            expect(result).toBe('2023-01-01T12:00:00.123Z');
        });

        it('should stringify without milliseconds when specified', () => {
            const date = new Date('2023-01-01T12:00:00.123Z');
            const result = dateStringifyWithPrecision(date, false);
            expect(result).toBe('2023-01-01T12:00:00Z');
        });

        it('should handle edge case of zero milliseconds', () => {
            const date = new Date('2023-01-01T12:00:00.000Z');
            const resultWithMs = dateStringifyWithPrecision(date, true);
            const resultWithoutMs = dateStringifyWithPrecision(date, false);

            expect(resultWithMs).toBe('2023-01-01T12:00:00.000Z');
            expect(resultWithoutMs).toBe('2023-01-01T12:00:00Z');
        });
    });

    describe('error handling integration', () => {
        it('should handle invalid date strings gracefully', () => {
            const invalidDateString = 'invalid-date';
            const parsedDate = dateParse(invalidDateString);
            expect(parsedDate).toBeUndefined();

            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBeUndefined();
        });

        it('should handle undefined inputs gracefully', () => {
            const parsedDate = dateParse(undefined);
            expect(parsedDate).toBeUndefined();

            const stringifiedDate = dateStringify(undefined);
            expect(stringifiedDate).toBeUndefined();
        });

        it('should handle null inputs gracefully', () => {
            const parsedDate = dateParse(null as any);
            expect(parsedDate).toBeUndefined();

            const stringifiedDate = dateStringify(null as any);
            expect(stringifiedDate).toBeUndefined();
        });
    });

    describe('real-world scenarios', () => {
        it('should handle RFC 8216 example date', () => {
            // Example from RFC 8216: 2010-02-19T14:54:23.031+08:00
            const rfcExample = '2010-02-19T14:54:23.031+08:00';

            const parsedDate = dateParse(rfcExample);
            expect(parsedDate).toBeInstanceOf(Date);

            const stringifiedDate = dateStringify(parsedDate);
            // Should convert to UTC: 2010-02-19T06:54:23.031Z
            expect(stringifiedDate).toBe('2010-02-19T06:54:23.031Z');
        });

        it('should handle leap year dates', () => {
            const leapYearDate = '2020-02-29T12:00:00.000Z';

            const parsedDate = dateParse(leapYearDate);
            expect(parsedDate).toBeInstanceOf(Date);

            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBe(leapYearDate);
        });

        it('should handle end of year dates', () => {
            const endOfYearDate = '2023-12-31T23:59:59.999Z';

            const parsedDate = dateParse(endOfYearDate);
            expect(parsedDate).toBeInstanceOf(Date);

            const stringifiedDate = dateStringify(parsedDate);
            expect(stringifiedDate).toBe(endOfYearDate);
        });

        it('should handle different millisecond precisions', () => {
            const dates = [
                '2023-01-01T12:00:00.1Z',
                '2023-01-01T12:00:00.12Z',
                '2023-01-01T12:00:00.123Z'
            ];

            dates.forEach(dateString => {
                const parsedDate = dateParse(dateString);
                expect(parsedDate).toBeInstanceOf(Date);

                const stringifiedDate = dateStringify(parsedDate);
                // Should normalize to 3-digit milliseconds
                expect(stringifiedDate).toMatch(/^2023-01-01T12:00:00\.\d{3}Z$/);
            });
        });
    });
}); 