import { describe, expect, it } from 'vitest';
import { extXEndListParser } from './parser';
import { extXEndListStringifier } from './stringifier';

describe('EXT-X-ENDLIST integration', () => {
    it('should parse and stringify round-trip', () => {
        const original = '#EXT-X-ENDLIST';
        const parsed = extXEndListParser(original);
        const stringified = extXEndListStringifier();

        expect(parsed).toBe(true);
        expect(stringified).toBe('#EXT-X-ENDLIST\n');
    });

    it('should handle undefined input', () => {
        const parsed = extXEndListParser(undefined);
        const stringified = extXEndListStringifier();

        expect(parsed).toBe(false);
        expect(stringified).toBe('#EXT-X-ENDLIST\n');
    });

    it('should handle empty string input', () => {
        const original = '';
        const parsed = extXEndListParser(original);
        const stringified = extXEndListStringifier();

        expect(parsed).toBe(true);
        expect(stringified).toBe('#EXT-X-ENDLIST\n');
    });

    it('should handle random string input', () => {
        const original = 'random text';
        const parsed = extXEndListParser(original);
        const stringified = extXEndListStringifier();

        expect(parsed).toBe(true);
        expect(stringified).toBe('#EXT-X-ENDLIST\n');
    });

    it('should maintain type safety through round-trip', () => {
        const original = '#EXT-X-ENDLIST';
        const parsed = extXEndListParser(original);
        const stringified = extXEndListStringifier();

        // TypeScript should infer the exact types
        expect(typeof parsed).toBe('boolean');
        expect(typeof stringified).toBe('string');
        expect(stringified).toBe('#EXT-X-ENDLIST\n');
    });

    it('should always stringify the same output regardless of input', () => {
        const inputs = [
            '#EXT-X-ENDLIST',
            'any string',
            '',
            undefined,
            'random text with spaces',
            '!@#$%^&*()'
        ];

        inputs.forEach(input => {
            const parsed = extXEndListParser(input);
            const stringified = extXEndListStringifier();

            expect(stringified).toBe('#EXT-X-ENDLIST\n');
        });
    });

    it('should include newline in output', () => {
        const stringified = extXEndListStringifier();

        expect(stringified).toContain('\n');
        expect(stringified.endsWith('\n')).toBe(true);
    });
}); 