import { describe, it, expect } from 'vitest';
import { extM3uParser } from './parser';
import { extM3uStringifier } from './stringifier';

describe('EXTM3U integration', () => {
    it('should parse and stringify round-trip', () => {
        const input = '#EXTM3U';
        const parsed = extM3uParser(input);
        const stringified = extM3uStringifier();
        expect(stringified).toBe(input);
    });

    it('should handle undefined input', () => {
        const input = undefined;
        const parsed = extM3uParser(input);
        expect(parsed).toBe(false);
    });

    it('should handle empty string input', () => {
        const input = '';
        const parsed = extM3uParser(input);
        expect(parsed).toBe(false);
    });

    it('should handle random string input', () => {
        const input = 'random text';
        const parsed = extM3uParser(input);
        expect(parsed).toBe(true);
    });

    it('should maintain type safety through round-trip', () => {
        const input = '#EXTM3U' as const;
        const parsed = extM3uParser(input);
        const stringified = extM3uStringifier();
        expect(stringified).toBe('#EXTM3U');
    });

    it('should always stringify the same output regardless of input', () => {
        const input1 = '#EXTM3U';
        const input2 = 'random text';
        const parsed1 = extM3uParser(input1);
        const parsed2 = extM3uParser(input2);
        const stringified1 = extM3uStringifier();
        const stringified2 = extM3uStringifier();
        expect(stringified1).toBe(stringified2);
        expect(stringified1).toBe('#EXTM3U');
    });
}); 