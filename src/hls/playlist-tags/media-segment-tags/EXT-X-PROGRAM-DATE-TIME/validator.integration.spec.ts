import { describe, expect, it } from 'vitest';
import { extXProgramDateTimeParser } from './parser';
import { extXProgramDateTimeValidator } from './validator';

describe('EXT-X-PROGRAM-DATE-TIME validator integration', () => {
    it('should validate parsed valid values', () => {
        const testCases = [
            '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00',
            '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z',
            '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23+08:00',
            '#EXT-X-PROGRAM-DATE-TIME:2023-12-25T10:30:45.123+00:00',
        ];

        testCases.forEach(testCase => {
            const parsed = extXProgramDateTimeParser(testCase);
            if (parsed) {
                const result = extXProgramDateTimeValidator.validate(parsed);
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            }
        });
    });

    it('should handle edge cases from parser', () => {
        // Test with different timezone formats
        const testCases = [
            '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031-05:00',
            '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031',
        ];

        testCases.forEach(testCase => {
            const parsed = extXProgramDateTimeParser(testCase);
            if (parsed) {
                const result = extXProgramDateTimeValidator.validate(parsed);
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            }
        });
    });

    it('should work with parser output types', () => {
        const testInput = '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00' as const;
        const parsed = extXProgramDateTimeParser(testInput);
        if (parsed) {
            const result = extXProgramDateTimeValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.tagName).toBe('#EXT-X-PROGRAM-DATE-TIME');
        }
    });

    it('should handle undefined parser output', () => {
        const invalidInput = 'invalid';
        const parsed = extXProgramDateTimeParser(invalidInput);
        expect(parsed).toBeUndefined();
    });
}); 