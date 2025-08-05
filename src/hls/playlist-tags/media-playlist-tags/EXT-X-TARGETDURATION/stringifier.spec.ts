import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXTargetDurationStringifier } from './stringifier';
import { EXT_X_TARGETDURATION_STRING } from './types';

describe('EXT-X-TARGETDURATION stringifier', () => {
    it('should stringify with template literal using passed value', () => {
        const value = 8;
        const stringified = extXTargetDurationStringifier(value);

        expect(stringified).toBe('#EXT-X-TARGETDURATION:8');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should stringify zero value', () => {
        const value = 0;
        const stringified = extXTargetDurationStringifier(value);

        expect(stringified).toBe('#EXT-X-TARGETDURATION:0');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should stringify large number', () => {
        const value = 30;
        const stringified = extXTargetDurationStringifier(value);

        expect(stringified).toBe('#EXT-X-TARGETDURATION:30');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should use the actual passed value', () => {
        const value = 15;
        const stringified = extXTargetDurationStringifier(value);

        expect(stringified).toBe('#EXT-X-TARGETDURATION:15');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should have correct generic type inference', () => {
        const value = 42 as const;
        const stringified = extXTargetDurationStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 