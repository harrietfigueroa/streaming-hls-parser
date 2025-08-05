import { describe, it, expect } from 'vitest';
import { extXVersionParser } from './parser';

describe('EXT-X-VERSION parser', () => {
    it('should parse valid version numbers', () => {
        expect(extXVersionParser('#EXT-X-VERSION:1')).toBe(1);
        expect(extXVersionParser('#EXT-X-VERSION:2')).toBe(2);
        expect(extXVersionParser('#EXT-X-VERSION:10')).toBe(10);
        expect(extXVersionParser('#EXT-X-VERSION:0')).toBe(0);
    });

    it('should parse large version numbers', () => {
        expect(extXVersionParser('#EXT-X-VERSION:999')).toBe(999);
        expect(extXVersionParser('#EXT-X-VERSION:1000')).toBe(1000);
    });

    it('should return undefined for invalid inputs', () => {
        expect(extXVersionParser('#EXT-X-VERSION:')).toBeUndefined();
        expect(extXVersionParser('#EXT-X-VERSION:abc')).toBeUndefined();
        expect(extXVersionParser('#EXT-X-VERSION:1.5')).toBeUndefined();
        expect(extXVersionParser('#EXT-X-VERSION:-1')).toBeUndefined();
    });

    it('should return undefined for malformed tags', () => {
        expect(extXVersionParser('EXT-X-VERSION:1')).toBeUndefined();
        expect(extXVersionParser('#EXT-X-VERSION')).toBeUndefined();
        expect(extXVersionParser('#EXT-X-VERSION:')).toBeUndefined();
        expect(extXVersionParser('')).toBeUndefined();
    });

    it('should have correct generic type inference', () => {
        const result = extXVersionParser('#EXT-X-VERSION:5' as const);
        expect(typeof result).toBe('number');
        expect(result).toBe(5);
    });

    it('should handle whitespace correctly', () => {
        expect(extXVersionParser('#EXT-X-VERSION: 1 ')).toBe(1);
        expect(extXVersionParser('#EXT-X-VERSION:1 ')).toBe(1);
        expect(extXVersionParser('#EXT-X-VERSION: 1')).toBe(1);
    });
}); 