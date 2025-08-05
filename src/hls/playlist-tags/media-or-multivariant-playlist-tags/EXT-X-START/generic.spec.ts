import { describe, it, expect } from 'vitest';
import { extXStartParser } from './parser';
import { extXStartStringifier } from './stringifier';

describe('EXT-X-START generic parser', () => {
    it('should demonstrate generic type inference', () => {
        const input = '#EXT-X-START:TIME-OFFSET=5.5,PRECISE=YES' as const;
        const result = extXStartParser(input);
        expect(result).toEqual({
            'TIME-OFFSET': 5.5,
            PRECISE: 'YES'
        });
        expect(typeof result).toBe('object');
    });

    it('should handle edge cases correctly', () => {
        const input = '#EXT-X-START:TIME-OFFSET=0' as const;
        const result = extXStartParser(input);
        expect(result).toEqual({
            'TIME-OFFSET': 0,
            PRECISE: undefined
        });
        expect(typeof result).toBe('object');
    });

    it('should demonstrate conditional type behavior', () => {
        const validInput = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO' as const;
        const validResult = extXStartParser(validInput);
        expect(validResult).toEqual({
            'TIME-OFFSET': 10.5,
            PRECISE: 'NO'
        });

        const invalidInput = '#EXT-X-START:TIME-OFFSET=abc' as const;
        const invalidResult = extXStartParser(invalidInput);
        expect(invalidResult).toBeUndefined();
    });
});

describe('EXT-X-START generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const input = {
            'TIME-OFFSET': 5.5 as const,
            PRECISE: 'YES' as const
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=5.5,PRECISE=YES');
        expect(typeof result).toBe('string');
    });

    it('should work with different number types', () => {
        const input1 = {
            'TIME-OFFSET': 1 as const,
            PRECISE: undefined
        };
        const input2 = {
            'TIME-OFFSET': 999 as const,
            PRECISE: 'NO' as const
        };

        expect(extXStartStringifier(input1)).toBe('#EXT-X-START:TIME-OFFSET=1');
        expect(extXStartStringifier(input2)).toBe('#EXT-X-START:TIME-OFFSET=999,PRECISE=NO');
    });

    it('should preserve literal types', () => {
        const input = {
            'TIME-OFFSET': 42 as const,
            PRECISE: 'YES' as const
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=42,PRECISE=YES');
    });
}); 