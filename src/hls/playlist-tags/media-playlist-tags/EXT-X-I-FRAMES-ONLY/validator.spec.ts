import { describe, expect, it } from 'vitest';
import { extXIFramesOnlyValidator } from './validator';

describe('EXT-X-I-FRAMES-ONLY validator', () => {
    it('should validate true value (tag present)', () => {
        const result = extXIFramesOnlyValidator.validate(true);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-I-FRAMES-ONLY');
    });

    it('should validate false value (tag not present)', () => {
        const result = extXIFramesOnlyValidator.validate(false);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-boolean values', () => {
        const result = extXIFramesOnlyValidator.validate('true' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-I-FRAMES-ONLY value must be a boolean indicating presence of the tag (RFC 8216 Section 4.3.3.6: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.6)');
        expect(result.errors[0].invalidValue).toBe('true');
    });

    it('should reject number values', () => {
        const result = extXIFramesOnlyValidator.validate(1 as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-I-FRAMES-ONLY value must be a boolean indicating presence of the tag (RFC 8216 Section 4.3.3.6: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.6)');
        expect(result.errors[0].invalidValue).toBe(1);
    });

    it('should reject null values', () => {
        const result = extXIFramesOnlyValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-I-FRAMES-ONLY value must be a boolean indicating presence of the tag (RFC 8216 Section 4.3.3.6: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.6)');
        expect(result.errors[0].invalidValue).toBe(null);
    });

    it('should reject undefined values', () => {
        const result = extXIFramesOnlyValidator.validate(undefined as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-I-FRAMES-ONLY value must be a boolean indicating presence of the tag (RFC 8216 Section 4.3.3.6: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.6)');
        expect(result.errors[0].invalidValue).toBe(undefined);
    });
}); 