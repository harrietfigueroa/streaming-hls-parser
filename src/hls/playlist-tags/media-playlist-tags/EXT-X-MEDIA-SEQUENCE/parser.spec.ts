import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXMediaSequenceParser } from './parser';

describe('EXT-X-MEDIA-SEQUENCE parser', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:5';
        const parsed = extXMediaSequenceParser(test);

        expect(parsed).toBe(5);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse zero value', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:0';
        const parsed = extXMediaSequenceParser(test);

        expect(parsed).toBe(0);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse large number', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:12345';
        const parsed = extXMediaSequenceParser(test);

        expect(parsed).toBe(12345);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse single digit', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:1';
        const parsed = extXMediaSequenceParser(test);

        expect(parsed).toBe(1);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse double digit', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:42';
        const parsed = extXMediaSequenceParser(test);

        expect(parsed).toBe(42);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse triple digit', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:100';
        const parsed = extXMediaSequenceParser(test);

        expect(parsed).toBe(100);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:42';
        const parsed = extXMediaSequenceParser(test);

        expectTypeOf(parsed).toBeNumber();
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(parsed).not.toBeBoolean();
    });
}); 