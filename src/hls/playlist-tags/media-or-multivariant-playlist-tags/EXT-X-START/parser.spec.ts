import { describe, it, expect } from 'vitest';
import { extXStartParser } from './parser';

describe('EXT-X-START parser', () => {
    it('should parse valid TIME-OFFSET only', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET=10.5');
        expect(result).toEqual({
            'TIME-OFFSET': 10.5,
            PRECISE: undefined
        });
    });

    it('should parse valid TIME-OFFSET and PRECISE=YES', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES');
        expect(result).toEqual({
            'TIME-OFFSET': 10.5,
            PRECISE: 'YES'
        });
    });

    it('should parse valid TIME-OFFSET and PRECISE=NO', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO');
        expect(result).toEqual({
            'TIME-OFFSET': 10.5,
            PRECISE: 'NO'
        });
    });

    it('should parse negative TIME-OFFSET', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET=-10.5');
        expect(result).toEqual({
            'TIME-OFFSET': -10.5,
            PRECISE: undefined
        });
    });

    it('should parse zero TIME-OFFSET', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET=0');
        expect(result).toEqual({
            'TIME-OFFSET': 0,
            PRECISE: undefined
        });
    });

    it('should handle whitespace in attributes', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET= 10.5 ,PRECISE= YES ');
        expect(result).toEqual({
            'TIME-OFFSET': 10.5,
            PRECISE: 'YES'
        });
    });

    it('should return undefined for malformed tags', () => {
        expect(extXStartParser('EXT-X-START:TIME-OFFSET=10.5')).toBeUndefined();
        expect(extXStartParser('#EXT-X-START')).toBeUndefined();
        expect(extXStartParser('#EXT-X-START:')).toBeUndefined();
        expect(extXStartParser('')).toBeUndefined();
    });

    it('should handle invalid TIME-OFFSET values', () => {
        expect(extXStartParser('#EXT-X-START:TIME-OFFSET=abc')).toBeUndefined();
        expect(extXStartParser('#EXT-X-START:TIME-OFFSET=')).toBeUndefined();
    });

    it('should have correct generic type inference', () => {
        const result = extXStartParser('#EXT-X-START:TIME-OFFSET=5.5,PRECISE=YES' as const);
        expect(typeof result).toBe('object');
        expect(result).toEqual({
            'TIME-OFFSET': 5.5,
            PRECISE: 'YES'
        });
    });
}); 