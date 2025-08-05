import { describe, it, expect } from 'vitest';
import { extXIndependentSegmentsParser } from './parser';
import { extXIndependentSegmentsStringifier } from './stringifier';

describe('EXT-X-INDEPENDENT-SEGMENTS integration', () => {
    it('should parse and stringify round-trip', () => {
        const input = '#EXT-X-INDEPENDENT-SEGMENTS';
        const parsed = extXIndependentSegmentsParser(input);
        const stringified = extXIndependentSegmentsStringifier();
        expect(stringified).toBe(input);
    });

    it('should handle undefined input', () => {
        const input = undefined;
        const parsed = extXIndependentSegmentsParser(input);
        expect(parsed).toBe(false);
    });

    it('should handle empty string input', () => {
        const input = '';
        const parsed = extXIndependentSegmentsParser(input);
        expect(parsed).toBe(false);
    });

    it('should handle random string input', () => {
        const input = 'random text';
        const parsed = extXIndependentSegmentsParser(input);
        expect(parsed).toBe(true);
    });

    it('should maintain type safety through round-trip', () => {
        const input = '#EXT-X-INDEPENDENT-SEGMENTS' as const;
        const parsed = extXIndependentSegmentsParser(input);
        const stringified = extXIndependentSegmentsStringifier();
        expect(stringified).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
    });

    it('should always stringify the same output regardless of input', () => {
        const input1 = '#EXT-X-INDEPENDENT-SEGMENTS';
        const input2 = 'random text';
        const parsed1 = extXIndependentSegmentsParser(input1);
        const parsed2 = extXIndependentSegmentsParser(input2);
        const stringified1 = extXIndependentSegmentsStringifier();
        const stringified2 = extXIndependentSegmentsStringifier();
        expect(stringified1).toBe(stringified2);
        expect(stringified1).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
    });
}); 