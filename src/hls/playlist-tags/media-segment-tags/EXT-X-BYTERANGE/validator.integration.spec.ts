import { describe, expect, it } from 'vitest';
import { extXByteRangeParser } from './parser';
import { extXByteRangeValidator } from './validator';

describe('EXT-X-BYTERANGE validator integration', () => {
    it('should validate parsed valid values', () => {
        const testCases = [
            '#EXT-X-BYTERANGE:1024',
            '#EXT-X-BYTERANGE:1024@2048',
            '#EXT-X-BYTERANGE:0',
            '#EXT-X-BYTERANGE:1048576@2097152',
        ];

        testCases.forEach(testCase => {
            const parsed = extXByteRangeParser(testCase as any);
            if (parsed) {
                const result = extXByteRangeValidator.validate(parsed);
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            }
        });
    });

    it('should handle edge cases from parser', () => {
        // Test with zero values
        const testCases = [
            '#EXT-X-BYTERANGE:0',
            '#EXT-X-BYTERANGE:1024@0',
        ];

        testCases.forEach(testCase => {
            const parsed = extXByteRangeParser(testCase as any);
            if (parsed) {
                const result = extXByteRangeValidator.validate(parsed);
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            }
        });
    });

    it('should work with parser output types', () => {
        const testInput = '#EXT-X-BYTERANGE:1024@2048' as const;
        const parsed = extXByteRangeParser(testInput);
        if (parsed) {
            const result = extXByteRangeValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.tagName).toBe('#EXT-X-BYTERANGE');
        }
    });

    it('should handle undefined parser output', () => {
        const invalidInput = 'invalid';
        const parsed = extXByteRangeParser(invalidInput as any);
        expect(parsed).toBeUndefined();
    });
}); 