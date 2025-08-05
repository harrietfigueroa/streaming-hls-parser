import { describe, it, expect } from 'vitest';
import { extXVersionParser } from './parser';
import { extXVersionStringifier } from './stringifier';

describe('EXT-X-VERSION integration', () => {
    it('should parse and stringify round-trip', () => {
        const input = '#EXT-X-VERSION:5';
        const parsed = extXVersionParser(input);
        const stringified = extXVersionStringifier(parsed!);
        expect(stringified).toBe(input);
    });

    it('should handle zero value round-trip', () => {
        const input = '#EXT-X-VERSION:0';
        const parsed = extXVersionParser(input);
        const stringified = extXVersionStringifier(parsed!);
        expect(stringified).toBe(input);
    });

    it('should handle large number round-trip', () => {
        const input = '#EXT-X-VERSION:999';
        const parsed = extXVersionParser(input);
        const stringified = extXVersionStringifier(parsed!);
        expect(stringified).toBe(input);
    });

    it('should handle invalid inputs correctly', () => {
        const invalidInput = '#EXT-X-VERSION:abc';
        const parsed = extXVersionParser(invalidInput);
        expect(parsed).toBeUndefined();
    });

    it('should maintain type safety through round-trip', () => {
        const input = '#EXT-X-VERSION:42' as const;
        const parsed = extXVersionParser(input);
        if (parsed !== undefined) {
            const stringified = extXVersionStringifier(parsed);
            expect(stringified).toBe('#EXT-X-VERSION:42');
        }
    });

    it('should handle whitespace in input', () => {
        const input = '#EXT-X-VERSION: 7 ';
        const parsed = extXVersionParser(input);
        const stringified = extXVersionStringifier(parsed!);
        expect(stringified).toBe('#EXT-X-VERSION:7');
    });
}); 