import { describe, expect, it } from 'vitest';
import { extinfParser } from './parser';
import { extinfValidator } from './validator';

describe('EXTINF validator integration', () => {
    it('should validate parsed valid values', () => {
        const testCases = [
            '#EXTINF:10.5,',
            '#EXTINF:8.2,Segment Title',
            '#EXTINF:15,',
            '#EXTINF:0,',
            '#EXTINF:5.7,Another Title',
        ];

        testCases.forEach(testCase => {
            const parsed = extinfParser(testCase);
            if (parsed) {
                const result = extinfValidator.validate(parsed);
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            }
        });
    });

    it('should handle edge cases from parser', () => {
        // Test with zero duration
        const zeroValue = '#EXTINF:0,';
        const parsed = extinfParser(zeroValue);
        if (parsed) {
            const result = extinfValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }
    });

    it('should validate integer duration from parser', () => {
        const integerValue = '#EXTINF:15,';
        const parsed = extinfParser(integerValue);
        if (parsed) {
            const result = extinfValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }
    });

    it('should work with parser output types', () => {
        const testInput = '#EXTINF:42.3,Test Segment' as const;
        const parsed = extinfParser(testInput);
        if (parsed) {
            const result = extinfValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.tagName).toBe('#EXTINF');
        }
    });

    it('should handle undefined parser output', () => {
        const invalidInput = 'invalid';
        const parsed = extinfParser(invalidInput);
        expect(parsed).toBeUndefined();
    });
}); 