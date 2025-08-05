import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXEndListParser } from './parser';

describe('EXT-X-ENDLIST parser', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-ENDLIST';
        const parsed = extXEndListParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return false for undefined input', () => {
        const parsed = extXEndListParser(undefined);

        expect(parsed).toBe(false);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for any string input', () => {
        const test = 'any string';
        const parsed = extXEndListParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for empty string', () => {
        const test = '';
        const parsed = extXEndListParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for whitespace string', () => {
        const test = '   ';
        const parsed = extXEndListParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for case variations', () => {
        const test1 = '#ext-x-endlist';
        const parsed1 = extXEndListParser(test1);
        expect(parsed1).toBe(true);
        expectTypeOf(parsed1).toBeBoolean();

        const test2 = '#EXT-X-ENDLIST';
        const parsed2 = extXEndListParser(test2);
        expect(parsed2).toBe(true);
        expectTypeOf(parsed2).toBeBoolean();
    });

    it('should return true for random text', () => {
        const test = 'random text with spaces';
        const parsed = extXEndListParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should return true for special characters', () => {
        const test = '!@#$%^&*()';
        const parsed = extXEndListParser(test);

        expect(parsed).toBe(true);
        expectTypeOf(parsed).toBeBoolean();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-ENDLIST' as const;
        const parsed = extXEndListParser(test);

        expectTypeOf(parsed).toBeBoolean();
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(parsed).not.toBeNumber();
    });
}); 