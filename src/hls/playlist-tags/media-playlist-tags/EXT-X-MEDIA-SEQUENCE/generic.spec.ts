import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXMediaSequenceStringifier } from './stringifier';
import { EXT_X_MEDIA_SEQUENCE_STRING } from './types';

describe('EXT-X-MEDIA-SEQUENCE generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const value = 5 as const;
        const stringified = extXMediaSequenceStringifier(value);

        // TypeScript should infer the exact type
        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:5');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should work with different number types', () => {
        const value1 = 0;
        const stringified1 = extXMediaSequenceStringifier(value1);
        expect(stringified1).toBe('#EXT-X-MEDIA-SEQUENCE:0');
        expectTypeOf(stringified1).toBeString();
        expectTypeOf(stringified1).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value1>>();

        const value2 = 42;
        const stringified2 = extXMediaSequenceStringifier(value2);
        expect(stringified2).toBe('#EXT-X-MEDIA-SEQUENCE:42');
        expectTypeOf(stringified2).toBeString();
        expectTypeOf(stringified2).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value2>>();
    });

    it('should work with large numbers', () => {
        const value = 12345;
        const stringified = extXMediaSequenceStringifier(value);
        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:12345');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should work with sequential numbers', () => {
        const value = 100;
        const stringified = extXMediaSequenceStringifier(value);
        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:100');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should preserve literal types', () => {
        const value = 42 as const;
        const stringified = extXMediaSequenceStringifier(value);

        expectTypeOf(stringified).toMatchTypeOf<'#EXT-X-MEDIA-SEQUENCE:42'>();
        expectTypeOf(stringified).not.toMatchTypeOf<'#EXT-X-MEDIA-SEQUENCE:43'>();
    });
}); 