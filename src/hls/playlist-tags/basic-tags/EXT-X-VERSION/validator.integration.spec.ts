import { describe, it, expect } from 'vitest';
import { extXVersionParser } from './parser';
import { extXVersionValidator } from './validator';

describe('EXT-X-VERSION validator integration', () => {
    it('should validate parsed valid values', () => {
        const input = '#EXT-X-VERSION:5';
        const parsed = extXVersionParser(input);
        const validation = extXVersionValidator.validate(parsed!);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should handle null values from parser for invalid inputs', () => {
        const input = '#EXT-X-VERSION:abc';
        const parsed = extXVersionParser(input);
        expect(parsed).toBeUndefined();
    });

    it('should validate zero value from parser', () => {
        const input = '#EXT-X-VERSION:0';
        const parsed = extXVersionParser(input);
        const validation = extXVersionValidator.validate(parsed!);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should validate large value from parser', () => {
        const input = '#EXT-X-VERSION:999';
        const parsed = extXVersionParser(input);
        const validation = extXVersionValidator.validate(parsed!);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should work with parser output types', () => {
        const input = '#EXT-X-VERSION:42';
        const parsed = extXVersionParser(input);
        if (parsed !== undefined) {
            const validation = extXVersionValidator.validate(parsed);
            expect(validation.isValid).toBe(true);
            expect(validation.tagName).toBe('#EXT-X-VERSION');
        }
    });
}); 