import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXTargetDurationStringifier } from './stringifier';
import { EXT_X_TARGETDURATION_STRING } from './types';

describe('EXT-X-TARGETDURATION generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const value = 8 as const;
        const stringified = extXTargetDurationStringifier(value);

        // TypeScript should infer the exact type
        expect(stringified).toBe('#EXT-X-TARGETDURATION:8');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should work with different number types', () => {
        const value1 = 10;
        const stringified1 = extXTargetDurationStringifier(value1);
        expect(stringified1).toBe('#EXT-X-TARGETDURATION:10');
        expectTypeOf(stringified1).toBeString();
        expectTypeOf(stringified1).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value1>>();

        const value2 = 30;
        const stringified2 = extXTargetDurationStringifier(value2);
        expect(stringified2).toBe('#EXT-X-TARGETDURATION:30');
        expectTypeOf(stringified2).toBeString();
        expectTypeOf(stringified2).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value2>>();
    });

    it('should work with zero value', () => {
        const value = 0;
        const stringified = extXTargetDurationStringifier(value);
        expect(stringified).toBe('#EXT-X-TARGETDURATION:0');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should work with large numbers', () => {
        const value = 999;
        const stringified = extXTargetDurationStringifier(value);
        expect(stringified).toBe('#EXT-X-TARGETDURATION:999');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_TARGETDURATION_STRING<typeof value>>();
    });

    it('should preserve literal types', () => {
        const value = 42 as const;
        const stringified = extXTargetDurationStringifier(value);

        expectTypeOf(stringified).toMatchTypeOf<'#EXT-X-TARGETDURATION:42'>();
        expectTypeOf(stringified).not.toMatchTypeOf<'#EXT-X-TARGETDURATION:43'>();
    });
}); 