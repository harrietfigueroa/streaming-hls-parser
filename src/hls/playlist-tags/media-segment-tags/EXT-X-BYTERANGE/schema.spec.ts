import { describe, expect, it, expectTypeOf } from 'vitest';
import { EXT_X_BYTERANGE_CODEC } from './schema';

describe('EXT-X-BYTERANGE parser', () => {
    it('should parse the tag with length only', () => {
        const test = '#EXT-X-BYTERANGE:1024';
        const result = EXT_X_BYTERANGE_CODEC.decode(test);

        expect(result).toEqual({
            n: 1024,
            o: undefined,
        });
    });

    it('should parse the tag with length and offset', () => {
        const test = '#EXT-X-BYTERANGE:1024@2048';
        const result = EXT_X_BYTERANGE_CODEC.decode(test);

        expect(result).toEqual({
            n: 1024,
            o: 2048,
        });
    });

    it('should parse large numbers', () => {
        const test = '#EXT-X-BYTERANGE:999999999999999@1000000';
        const result = EXT_X_BYTERANGE_CODEC.decode(test);

        expect(result).toEqual({
            n: 999999999999999,
            o: 1000000,
        });
    });

    it('should return error for invalid input without @', () => {
        const test = '#EXT-X-BYTERANGE:invalid';

        // @ts-expect-error invalid input
        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for invalid input with @ but no offset', () => {
        const test = '#EXT-X-BYTERANGE:1024@';

        // @ts-expect-error invalid input
        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for invalid input with @ but no length', () => {
        const test = '#EXT-X-BYTERRANGE:@1024';

        // @ts-expect-error invalid input
        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for negative numbers', () => {
        const test = '#EXT-X-BYTERANGE:-1024';
        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for negative offset', () => {
        const test = '#EXT-X-BYTERANGE:1024@-2048';

        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for non-numeric input', () => {
        const test = '#EXT-X-BYTERANGE:abc@def';

        // @ts-expect-error invalid input
        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for decimal numbers', () => {
        const test = '#EXT-X-BYTERANGE:1024.5@2048';

        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });

    it('should return error for decimal offset', () => {
        const test = '#EXT-X-BYTERANGE:1024@2048.5';

        expect(() => EXT_X_BYTERANGE_CODEC.decode(test)).toThrow();
    });
});

describe('EXT-X-BYTERANGE encoder', () => {
    it('should encode object with length only', () => {
        const input = {
            n: 1024,
            o: undefined,
        };
        const encoded = EXT_X_BYTERANGE_CODEC.encode(input);

        expect(encoded).toBe('#EXT-X-BYTERANGE:1024');
        expectTypeOf(encoded).toBeString();
    });

    it('should encode object with length and offset', () => {
        const input = {
            n: 1024,
            o: 2048,
        };
        const encoded = EXT_X_BYTERANGE_CODEC.encode(input);

        expect(encoded).toBe('#EXT-X-BYTERANGE:1024@2048');
        expectTypeOf(encoded).toBeString();
    });

    it('should encode large numbers', () => {
        const input = {
            n: 999999999999999,
            o: 1000000,
        };
        const encoded = EXT_X_BYTERANGE_CODEC.encode(input);

        expect(encoded).toBe('#EXT-X-BYTERANGE:999999999999999@1000000');
        expectTypeOf(encoded).toBeString();
    });

    it('should encode single digit numbers', () => {
        const input = {
            n: 1,
            o: 2,
        };
        const encoded = EXT_X_BYTERANGE_CODEC.encode(input);

        expect(encoded).toBe('#EXT-X-BYTERANGE:1@2');
        expectTypeOf(encoded).toBeString();
    });

    it('should have correct return type inference', () => {
        const input = {
            n: 1024,
            o: 2048,
        } as const;
        const encoded = EXT_X_BYTERANGE_CODEC.encode(input);

        expect(encoded).toBeDefined();
        expectTypeOf(encoded).toBeString();
    });
});

describe('EXT-X-BYTERANGE roundtrip', () => {
    it('should roundtrip length only', () => {
        const original = '#EXT-X-BYTERANGE:1024';
        const result = EXT_X_BYTERANGE_CODEC.decode(original);
        expect(result).toBeDefined();
        const encoded = EXT_X_BYTERANGE_CODEC.encode(result);
        expect(encoded).toBe(original);
    });

    it('should roundtrip length and offset', () => {
        const original = '#EXT-X-BYTERANGE:1024@2048';
        const result = EXT_X_BYTERANGE_CODEC.decode(original);
        expect(result).toBeDefined();
        const encoded = EXT_X_BYTERANGE_CODEC.encode(result);
        expect(encoded).toBe(original);
    });

    it('should roundtrip large numbers', () => {
        const original = '#EXT-X-BYTERANGE:999999999999999@1000000';
        const result = EXT_X_BYTERANGE_CODEC.decode(original);
        expect(result).toBeDefined();
        const encoded = EXT_X_BYTERANGE_CODEC.encode(result);
        expect(encoded).toBe(original);
    });

    it('should roundtrip single digit numbers', () => {
        const original = '#EXT-X-BYTERANGE:1@2';
        const result = EXT_X_BYTERANGE_CODEC.decode(original);
        expect(result).toBeDefined();
        const encoded = EXT_X_BYTERANGE_CODEC.encode(result);
        expect(encoded).toBe(original);
    });
});
