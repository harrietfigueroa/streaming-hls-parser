import { describe, expect, it } from 'vitest';
import { extXByteRangeParser } from './parser';

describe('EXT-X-BYTERANGE parser', () => {
    it('should parse the tag with length only', () => {
        const test = '#EXT-X-BYTERANGE:1024';
        const parsed = extXByteRangeParser(test);

        expect(parsed).toEqual({
            LENGTH: 1024,
            OFFSET: undefined
        });
        expect(parsed).toBeDefined();
    });

    it('should parse the tag with length and offset', () => {
        const test = '#EXT-X-BYTERANGE:1024@2048';
        const parsed = extXByteRangeParser(test);

        expect(parsed).toEqual({
            LENGTH: 1024,
            OFFSET: 2048
        });
        expect(parsed).toBeDefined();
    });

    it('should parse zero length', () => {
        const test = '#EXT-X-BYTERANGE:0';
        const parsed = extXByteRangeParser(test);

        expect(parsed).toEqual({
            LENGTH: 0,
            OFFSET: undefined
        });
        expect(parsed).toBeDefined();
    });

    it('should parse zero offset', () => {
        const test = '#EXT-X-BYTERANGE:1024@0';
        const parsed = extXByteRangeParser(test);

        expect(parsed).toEqual({
            LENGTH: 1024,
            OFFSET: 0
        });
        expect(parsed).toBeDefined();
    });

    it('should parse large numbers', () => {
        const test = '#EXT-X-BYTERANGE:1048576@2097152';
        const parsed = extXByteRangeParser(test);

        expect(parsed).toEqual({
            LENGTH: 1048576,
            OFFSET: 2097152
        });
        expect(parsed).toBeDefined();
    });

    it('should return undefined for invalid input', () => {
        const test = '#EXT-X-BYTERANGE:invalid' as any;
        const parsed = extXByteRangeParser(test);

        expect(parsed).toBeUndefined();
    });

    it('should return undefined for missing tag', () => {
        const test = 'not-a-tag' as any;
        const parsed = extXByteRangeParser(test);

        expect(parsed).toBeUndefined();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-BYTERANGE:1024@2048' as const;
        const parsed = extXByteRangeParser(test);

        expect(parsed).toBeDefined();
    });
}); 