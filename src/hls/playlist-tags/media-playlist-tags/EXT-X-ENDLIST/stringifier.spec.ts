import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXEndListStringifier } from './stringifier';
import { EXT_X_ENDLIST_STRING } from './types';

describe('EXT-X-ENDLIST stringifier', () => {
    it('should stringify with template literal', () => {
        const stringified = extXEndListStringifier();

        expect(stringified).toBe('#EXT-X-ENDLIST\n');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_ENDLIST_STRING>();
    });

    it('should have correct generic type inference', () => {
        const stringified = extXEndListStringifier();

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_ENDLIST_STRING>();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 