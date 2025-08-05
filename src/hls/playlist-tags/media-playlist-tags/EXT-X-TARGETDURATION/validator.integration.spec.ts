import { describe, expect, it } from 'vitest';
import { extXTargetDurationParser } from './parser';
import { extXTargetDurationValidator } from './validator';

describe('EXT-X-TARGETDURATION validator integration', () => {
    it('should validate parsed valid values', () => {
        const testCases = [
            '#EXT-X-TARGETDURATION:10',
            '#EXT-X-TARGETDURATION:0',
            '#EXT-X-TARGETDURATION:30',
            '#EXT-X-TARGETDURATION:5',
            '#EXT-X-TARGETDURATION:15',
        ];

        testCases.forEach(testCase => {
            const parsed = extXTargetDurationParser(testCase);
            const result = extXTargetDurationValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    it('should handle edge cases from parser', () => {
        // Test with maximum valid value
        const maxValue = '#EXT-X-TARGETDURATION:4294967295';
        const parsed = extXTargetDurationParser(maxValue);
        const result = extXTargetDurationValidator.validate(parsed);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate zero value from parser', () => {
        const zeroValue = '#EXT-X-TARGETDURATION:0';
        const parsed = extXTargetDurationParser(zeroValue);
        const result = extXTargetDurationValidator.validate(parsed);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should work with parser output types', () => {
        const testInput = '#EXT-X-TARGETDURATION:42' as const;
        const parsed = extXTargetDurationParser(testInput);
        const result = extXTargetDurationValidator.validate(parsed);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-TARGETDURATION');
    });
}); 