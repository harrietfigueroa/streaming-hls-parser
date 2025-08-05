import { describe, expect, it } from 'vitest';
import { extXIFramesOnlyParser } from './parser';
import { extXIFramesOnlyStringifier } from './stringifier';

describe('EXT-X-I-FRAMES-ONLY integration', () => {
    it('should parse and stringify round-trip', () => {
        const original = '#EXT-X-I-FRAMES-ONLY';
        const parsed = extXIFramesOnlyParser(original);
        const stringified = extXIFramesOnlyStringifier();

        expect(parsed).toBe(true);
        expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
    });

    it('should handle undefined input', () => {
        const parsed = extXIFramesOnlyParser(undefined);
        const stringified = extXIFramesOnlyStringifier();

        expect(parsed).toBe(false);
        expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
    });

    it('should handle empty string input', () => {
        const original = '';
        const parsed = extXIFramesOnlyParser(original);
        const stringified = extXIFramesOnlyStringifier();

        expect(parsed).toBe(true);
        expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
    });

    it('should handle random string input', () => {
        const original = 'random text';
        const parsed = extXIFramesOnlyParser(original);
        const stringified = extXIFramesOnlyStringifier();

        expect(parsed).toBe(true);
        expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
    });

    it('should maintain type safety through round-trip', () => {
        const original = '#EXT-X-I-FRAMES-ONLY';
        const parsed = extXIFramesOnlyParser(original);
        const stringified = extXIFramesOnlyStringifier();

        // TypeScript should infer the exact types
        expect(typeof parsed).toBe('boolean');
        expect(typeof stringified).toBe('string');
        expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
    });

    it('should always stringify the same output regardless of input', () => {
        const inputs = [
            '#EXT-X-I-FRAMES-ONLY',
            'any string',
            '',
            undefined,
            'random text with spaces'
        ];

        inputs.forEach(input => {
            const parsed = extXIFramesOnlyParser(input);
            const stringified = extXIFramesOnlyStringifier();

            expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
        });
    });
}); 