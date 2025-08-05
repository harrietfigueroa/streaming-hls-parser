import { describe, it, expect } from 'vitest';
import { extXStartStringifier } from './stringifier';

describe('EXT-X-START stringifier', () => {
    it('should stringify TIME-OFFSET only', () => {
        const input = {
            'TIME-OFFSET': 10.5,
            PRECISE: undefined
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=10.5');
    });

    it('should stringify TIME-OFFSET and PRECISE=YES', () => {
        const input = {
            'TIME-OFFSET': 10.5,
            PRECISE: 'YES' as const
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES');
    });

    it('should stringify TIME-OFFSET and PRECISE=NO', () => {
        const input = {
            'TIME-OFFSET': 10.5,
            PRECISE: 'NO' as const
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO');
    });

    it('should stringify negative TIME-OFFSET', () => {
        const input = {
            'TIME-OFFSET': -10.5,
            PRECISE: undefined
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=-10.5');
    });

    it('should stringify zero TIME-OFFSET', () => {
        const input = {
            'TIME-OFFSET': 0,
            PRECISE: undefined
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=0');
    });

    it('should use the actual passed values', () => {
        const input = {
            'TIME-OFFSET': 42.7,
            PRECISE: 'YES' as const
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=42.7,PRECISE=YES');
    });

    it('should have correct generic type inference', () => {
        const input = {
            'TIME-OFFSET': 5.5 as const,
            PRECISE: 'YES' as const
        };
        const result = extXStartStringifier(input);
        expect(result).toBe('#EXT-X-START:TIME-OFFSET=5.5,PRECISE=YES');
        expect(typeof result).toBe('string');
    });
}); 