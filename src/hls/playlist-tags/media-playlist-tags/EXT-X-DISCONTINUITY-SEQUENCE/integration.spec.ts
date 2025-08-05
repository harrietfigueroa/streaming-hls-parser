import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXDiscontinuitySequenceParser } from './parser';
import { extXDiscontinuitySequenceStringifier } from './stringifier';

describe('EXT-X-DISCONTINUITY-SEQUENCE integration', () => {
    it('should parse and stringify round-trip', () => {
        const original = '#EXT-X-DISCONTINUITY-SEQUENCE:8';
        const parsed = extXDiscontinuitySequenceParser(original);
        const stringified = extXDiscontinuitySequenceStringifier(parsed);

        expect(parsed).toBe(8);
        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:8');
        expectTypeOf(parsed).toMatchTypeOf<number | undefined>();
        expectTypeOf(stringified).toBeString();
    });

    it('should handle zero value round-trip', () => {
        const original = '#EXT-X-DISCONTINUITY-SEQUENCE:0';
        const parsed = extXDiscontinuitySequenceParser(original);
        const stringified = extXDiscontinuitySequenceStringifier(parsed);

        expect(parsed).toBe(0);
        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:0');
        expectTypeOf(parsed).toMatchTypeOf<number | undefined>();
        expectTypeOf(stringified).toBeString();
    });

    it('should handle large number round-trip', () => {
        const original = '#EXT-X-DISCONTINUITY-SEQUENCE:12345';
        const parsed = extXDiscontinuitySequenceParser(original);
        const stringified = extXDiscontinuitySequenceStringifier(parsed);

        expect(parsed).toBe(12345);
        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:12345');
        expectTypeOf(parsed).toMatchTypeOf<number | undefined>();
        expectTypeOf(stringified).toBeString();
    });

    it('should handle invalid inputs correctly', () => {
        const invalidOriginal = '#EXT-X-DISCONTINUITY-SEQUENCE:-5';
        const parsed = extXDiscontinuitySequenceParser(invalidOriginal);

        expect(parsed).toBe(-5);
    });

    it('should maintain type safety through round-trip', () => {
        const original = '#EXT-X-DISCONTINUITY-SEQUENCE:42';
        const parsed = extXDiscontinuitySequenceParser(original);
        const stringified = extXDiscontinuitySequenceStringifier(parsed);

        // TypeScript should infer the exact types
        expect(typeof parsed).toBe('number');
        expect(typeof stringified).toBe('string');
        expect(stringified).toMatch(/^#EXT-X-DISCONTINUITY-SEQUENCE:\d+$/);
        expectTypeOf(parsed).toMatchTypeOf<number | undefined>();
        expectTypeOf(stringified).toBeString();
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(stringified).not.toBeNumber();
    });

    it('should preserve generic types through round-trip', () => {
        const original = '#EXT-X-DISCONTINUITY-SEQUENCE:999' as const;
        const parsed = extXDiscontinuitySequenceParser(original);
        const stringified = extXDiscontinuitySequenceStringifier(parsed);

        expectTypeOf(parsed).toMatchTypeOf<number | undefined>();
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<string>();
    });
}); 