import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXByteRangeStringifier } from './stringifier';

describe('EXT-X-BYTERANGE stringifier', () => {
    it('should stringify with length only', () => {
        const value = { LENGTH: 1024 };
        const stringified = extXByteRangeStringifier(value);

        expect(stringified).toBe('#EXT-X-BYTERANGE:1024');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify with length and offset', () => {
        const value = { LENGTH: 1024, OFFSET: 2048 };
        const stringified = extXByteRangeStringifier(value);

        expect(stringified).toBe('#EXT-X-BYTERANGE:1024@2048');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify zero length', () => {
        const value = { LENGTH: 0 };
        const stringified = extXByteRangeStringifier(value);

        expect(stringified).toBe('#EXT-X-BYTERANGE:0');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify zero offset', () => {
        const value = { LENGTH: 1024, OFFSET: 0 };
        const stringified = extXByteRangeStringifier(value);

        expect(stringified).toBe('#EXT-X-BYTERANGE:1024@0');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify large numbers', () => {
        const value = { LENGTH: 1048576, OFFSET: 2097152 };
        const stringified = extXByteRangeStringifier(value);

        expect(stringified).toBe('#EXT-X-BYTERANGE:1048576@2097152');
        expectTypeOf(stringified).toBeString();
    });

    it('should use the actual passed values', () => {
        const value = { LENGTH: 512, OFFSET: 1024 };
        const stringified = extXByteRangeStringifier(value);

        expect(stringified).toBe('#EXT-X-BYTERANGE:512@1024');
        expectTypeOf(stringified).toBeString();
    });

    it('should have correct generic type inference', () => {
        const value = { LENGTH: 1024, OFFSET: 2048 } as const;
        const stringified = extXByteRangeStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 