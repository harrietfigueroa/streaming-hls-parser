import { describe, it, expect } from 'vitest';
import { extM3uParser } from './parser';

describe('EXTM3U parser', () => {
    it('should parse the tag', () => {
        expect(extM3uParser('#EXTM3U')).toBe(true);
    });

    it('should return false for undefined input', () => {
        expect(extM3uParser(undefined)).toBe(false);
    });

    it('should return true for any string input', () => {
        expect(extM3uParser('#EXTM3U')).toBe(true);
        expect(extM3uParser('#EXTM3U ')).toBe(true);
        expect(extM3uParser(' #EXTM3U')).toBe(true);
    });

    it('should return false for empty string', () => {
        expect(extM3uParser('')).toBe(false);
    });

    it('should return false for whitespace string', () => {
        expect(extM3uParser('   ')).toBe(false);
    });

    it('should return true for case variations', () => {
        expect(extM3uParser('#extm3u')).toBe(true);
        expect(extM3uParser('#ExtM3u')).toBe(true);
    });

    it('should return true for random text', () => {
        expect(extM3uParser('random text')).toBe(true);
    });

    it('should have correct generic type inference', () => {
        const result = extM3uParser('#EXTM3U' as const);
        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
    });
}); 