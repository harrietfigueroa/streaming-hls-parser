import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXIFramesOnlyStringifier } from './stringifier';
import { EXT_X_I_FRAMES_ONLY_STRING } from './types';

describe('EXT-X-I-FRAMES-ONLY stringifier', () => {
    it('should stringify with template literal', () => {
        const stringified = extXIFramesOnlyStringifier();

        expect(stringified).toBe('#EXT-X-I-FRAMES-ONLY');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_I_FRAMES_ONLY_STRING>();
    });

    it('should have correct generic type inference', () => {
        const stringified = extXIFramesOnlyStringifier();

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_I_FRAMES_ONLY_STRING>();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 