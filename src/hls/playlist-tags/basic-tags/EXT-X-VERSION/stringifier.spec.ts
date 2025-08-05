import { describe, it, expect } from 'vitest';
import { extXVersionStringifier } from './stringifier';

describe('EXT-X-VERSION stringifier', () => {
    it('should stringify with template literal using passed value', () => {
        expect(extXVersionStringifier(1)).toBe('#EXT-X-VERSION:1');
        expect(extXVersionStringifier(2)).toBe('#EXT-X-VERSION:2');
        expect(extXVersionStringifier(10)).toBe('#EXT-X-VERSION:10');
    });

    it('should stringify zero value', () => {
        expect(extXVersionStringifier(0)).toBe('#EXT-X-VERSION:0');
    });

    it('should stringify large number', () => {
        expect(extXVersionStringifier(999)).toBe('#EXT-X-VERSION:999');
        expect(extXVersionStringifier(1000)).toBe('#EXT-X-VERSION:1000');
    });

    it('should use the actual passed value', () => {
        const version = 42;
        const result = extXVersionStringifier(version);
        expect(result).toBe('#EXT-X-VERSION:42');
    });

    it('should have correct generic type inference', () => {
        const version = 5 as const;
        const result = extXVersionStringifier(version);
        expect(result).toBe('#EXT-X-VERSION:5');
        expect(typeof result).toBe('string');
    });
}); 