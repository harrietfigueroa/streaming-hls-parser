import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXTargetDurationParser } from './parser';

describe('EXT-X-TARGETDURATION parser', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-TARGETDURATION:8';
        const parsed: number = extXTargetDurationParser(test);

        expect(parsed).toEqual(8);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse zero value', () => {
        const test = '#EXT-X-TARGETDURATION:0';
        const parsed: number = extXTargetDurationParser(test);

        expect(parsed).toEqual(0);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse large number', () => {
        const test = '#EXT-X-TARGETDURATION:30';
        const parsed: number = extXTargetDurationParser(test);

        expect(parsed).toEqual(30);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse single digit', () => {
        const test = '#EXT-X-TARGETDURATION:5';
        const parsed: number = extXTargetDurationParser(test);

        expect(parsed).toEqual(5);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should parse double digit', () => {
        const test = '#EXT-X-TARGETDURATION:15';
        const parsed: number = extXTargetDurationParser(test);

        expect(parsed).toEqual(15);
        expectTypeOf(parsed).toBeNumber();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-TARGETDURATION:10' as const;
        const parsed = extXTargetDurationParser(test);

        expectTypeOf(parsed).toBeNumber();
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(parsed).not.toBeBoolean();
    });
});
