import { describe, it, expect } from 'vitest';
import { extXDiscontinuityValidator } from './validator';
import { EXTXDISCONTINUITYNotABooleanError } from './types';

describe('EXT-X-DISCONTINUITY validator', () => {
    it('should always validate as true for boolean tags', () => {
        const result = extXDiscontinuityValidator.validate(true);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for any input (boolean tags are always valid)', () => {
        const result = extXDiscontinuityValidator.validate(false);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for non-boolean values', () => {
        const result = extXDiscontinuityValidator.validate('not a boolean' as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for number values', () => {
        const result = extXDiscontinuityValidator.validate(123 as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for null values', () => {
        const result = extXDiscontinuityValidator.validate(null as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for undefined values', () => {
        const result = extXDiscontinuityValidator.validate(undefined as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for object values', () => {
        const result = extXDiscontinuityValidator.validate({} as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for array values', () => {
        const result = extXDiscontinuityValidator.validate([] as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-DISCONTINUITY');
    });
}); 