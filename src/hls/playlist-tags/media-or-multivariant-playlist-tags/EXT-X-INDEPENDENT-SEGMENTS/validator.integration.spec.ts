import { describe, it, expect } from 'vitest';
import { extXIndependentSegmentsParser } from './parser';
import { extXIndependentSegmentsValidator } from './validator';

describe('EXT-X-INDEPENDENT-SEGMENTS validator integration', () => {
    it('should validate parsed valid values', () => {
        const input = '#EXT-X-INDEPENDENT-SEGMENTS';
        const parsed = extXIndependentSegmentsParser(input);
        const validation = extXIndependentSegmentsValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should handle false values from parser for invalid inputs', () => {
        const input = '';
        const parsed = extXIndependentSegmentsParser(input);
        expect(parsed).toBe(false);
    });

    it('should validate true value from parser', () => {
        const input = '#EXT-X-INDEPENDENT-SEGMENTS';
        const parsed = extXIndependentSegmentsParser(input);
        const validation = extXIndependentSegmentsValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should validate false value from parser', () => {
        const input = '';
        const parsed = extXIndependentSegmentsParser(input);
        const validation = extXIndependentSegmentsValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should work with parser output types', () => {
        const input = '#EXT-X-INDEPENDENT-SEGMENTS';
        const parsed = extXIndependentSegmentsParser(input);
        const validation = extXIndependentSegmentsValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.tagName).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
    });
}); 