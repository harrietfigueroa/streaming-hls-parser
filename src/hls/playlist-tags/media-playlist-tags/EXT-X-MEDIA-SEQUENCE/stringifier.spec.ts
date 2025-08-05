import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXMediaSequenceStringifier } from './stringifier';
import { EXT_X_MEDIA_SEQUENCE_STRING } from './types';

describe('EXT-X-MEDIA-SEQUENCE stringifier', () => {
    it('should stringify with template literal using passed value', () => {
        const value = 5;
        const stringified = extXMediaSequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:5');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should stringify zero value', () => {
        const value = 0;
        const stringified = extXMediaSequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:0');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should stringify large number', () => {
        const value = 12345;
        const stringified = extXMediaSequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:12345');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should use the actual passed value', () => {
        const value = 42;
        const stringified = extXMediaSequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-MEDIA-SEQUENCE:42');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
    });

    it('should have correct generic type inference', () => {
        const value = 42 as const;
        const stringified = extXMediaSequenceStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_MEDIA_SEQUENCE_STRING<typeof value>>();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 