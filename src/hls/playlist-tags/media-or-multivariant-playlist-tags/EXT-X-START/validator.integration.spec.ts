import { describe, it, expect } from 'vitest';
import { extXStartParser } from './parser';
import { extXStartValidator } from './validator';

describe('EXT-X-START validator integration', () => {
    it('should validate parsed valid values', () => {
        const input = '#EXT-X-START:TIME-OFFSET=10.5';
        const parsed = extXStartParser(input);
        const validation = extXStartValidator.validate(parsed as any);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should handle undefined values from parser for invalid inputs', () => {
        const input = '#EXT-X-START:TIME-OFFSET=abc';
        const parsed = extXStartParser(input);
        expect(parsed).toBeUndefined();
    });

    it('should validate TIME-OFFSET only from parser', () => {
        const input = '#EXT-X-START:TIME-OFFSET=5.5';
        const parsed = extXStartParser(input);
        const validation = extXStartValidator.validate(parsed as any);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should validate TIME-OFFSET and PRECISE from parser', () => {
        const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES';
        const parsed = extXStartParser(input);
        const validation = extXStartValidator.validate(parsed as any);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('should work with parser output types', () => {
        const input = '#EXT-X-START:TIME-OFFSET=42.7,PRECISE=NO';
        const parsed = extXStartParser(input);
        if (parsed !== undefined) {
            const validation = extXStartValidator.validate(parsed as any);
            expect(validation.isValid).toBe(true);
            expect(validation.tagName).toBe('#EXT-X-START');
        }
    });
}); 