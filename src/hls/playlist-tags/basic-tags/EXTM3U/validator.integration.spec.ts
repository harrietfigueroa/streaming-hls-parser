import { describe, it, expect } from 'vitest';
import { extM3uParser } from './parser';
import { extM3uValidator } from './validator';

describe('EXTM3U validator integration', () => {
    it('should validate parsed valid values', () => {
        const input = '#EXTM3U';
        const parsed = extM3uParser(input);
        const validation = extM3uValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should handle false values from parser for invalid inputs', () => {
        const input = '';
        const parsed = extM3uParser(input);
        expect(parsed).toBe(false);
    });

    it('should validate true value from parser', () => {
        const input = '#EXTM3U';
        const parsed = extM3uParser(input);
        const validation = extM3uValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should validate false value from parser', () => {
        const input = '';
        const parsed = extM3uParser(input);
        const validation = extM3uValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should work with parser output types', () => {
        const input = '#EXTM3U';
        const parsed = extM3uParser(input);
        const validation = extM3uValidator.validate(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.tagName).toBe('#EXTM3U');
    });
}); 