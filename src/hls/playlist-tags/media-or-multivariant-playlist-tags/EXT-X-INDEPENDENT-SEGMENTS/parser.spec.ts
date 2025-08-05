import { describe, it, expect } from 'vitest';
import { extXIndependentSegmentsParser } from './parser';

describe('EXT-X-INDEPENDENT-SEGMENTS parser', () => {
    it('should parse the tag', () => {
        expect(extXIndependentSegmentsParser('#EXT-X-INDEPENDENT-SEGMENTS')).toBe(true);
    });

    it('should return false for undefined input', () => {
        expect(extXIndependentSegmentsParser(undefined)).toBe(false);
    });

    it('should return true for any string input', () => {
        expect(extXIndependentSegmentsParser('#EXT-X-INDEPENDENT-SEGMENTS')).toBe(true);
        expect(extXIndependentSegmentsParser('#EXT-X-INDEPENDENT-SEGMENTS ')).toBe(true);
        expect(extXIndependentSegmentsParser(' #EXT-X-INDEPENDENT-SEGMENTS')).toBe(true);
    });

    it('should return false for empty string', () => {
        expect(extXIndependentSegmentsParser('')).toBe(false);
    });

    it('should return false for whitespace string', () => {
        expect(extXIndependentSegmentsParser('   ')).toBe(false);
    });

    it('should return true for case variations', () => {
        expect(extXIndependentSegmentsParser('#ext-x-independent-segments')).toBe(true);
        expect(extXIndependentSegmentsParser('#Ext-X-Independent-Segments')).toBe(true);
    });

    it('should return true for random text', () => {
        expect(extXIndependentSegmentsParser('random text')).toBe(true);
    });

    it('should have correct generic type inference', () => {
        const result = extXIndependentSegmentsParser('#EXT-X-INDEPENDENT-SEGMENTS' as const);
        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
    });
}); 