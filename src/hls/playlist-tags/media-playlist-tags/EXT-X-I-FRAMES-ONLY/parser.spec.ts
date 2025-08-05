import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXIFramesOnlyParser } from './parser';

describe('EXT-X-I-FRAMES-ONLY parser', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-I-FRAMES-ONLY';
        const parsed = extXIFramesOnlyParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return false for undefined input', () => {
        const parsed = extXIFramesOnlyParser(undefined);

        expect(parsed).toBe(false);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for any string input', () => {
        const test = 'any string';
        const parsed = extXIFramesOnlyParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for empty string', () => {
        const test = '';
        const parsed = extXIFramesOnlyParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for whitespace string', () => {
        const test = '   ';
        const parsed = extXIFramesOnlyParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for case variations', () => {
        const test1 = '#ext-x-i-frames-only';
        const parsed1 = extXIFramesOnlyParser(test1);
        expect(parsed1).toBe(true);
        expectTypeOf(parsed1).toBeBoolean();

        const test2 = '#EXT-X-I-FRAMES-ONLY';
        const parsed2 = extXIFramesOnlyParser(test2);
        expect(parsed2).toBe(true);
        expectTypeOf(parsed2).toBeBoolean();
    });

    it('should return true for random text', () => {
        const test = 'random text with spaces';
        const parsed = extXIFramesOnlyParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-I-FRAMES-ONLY' as const;
        const parsed = extXIFramesOnlyParser(test);

        expectTypeOf(parsed).toBeBoolean();
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(parsed).not.toBeNumber();
    });
}); 