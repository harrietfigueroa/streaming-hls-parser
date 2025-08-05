import { describe, it, expect } from 'vitest';
import { extM3uStringifier } from './stringifier';

describe('EXTM3U stringifier', () => {
    it('should stringify with template literal', () => {
        const result = extM3uStringifier();
        expect(result).toBe('#EXTM3U');
    });

    it('should have correct generic type inference', () => {
        const result = extM3uStringifier();
        expect(result).toBe('#EXTM3U');
        expect(typeof result).toBe('string');
    });

    it('should always return the same value', () => {
        const result1 = extM3uStringifier();
        const result2 = extM3uStringifier();
        expect(result1).toBe(result2);
        expect(result1).toBe('#EXTM3U');
    });
}); 