import { describe, expect, it } from 'vitest';
import { extXEndListValidator } from './validator';

describe('EXT-X-ENDLIST validator', () => {
    it('should validate true value (tag present)', () => {
        const result = extXEndListValidator.validate(true);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-ENDLIST');
    });

    it('should validate false value (tag not present)', () => {
        const result = extXEndListValidator.validate(false);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-boolean values', () => {
        const result = extXEndListValidator.validate('true' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-ENDLIST value must be a boolean (RFC 8216 Section 4.3.3.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.4)');
        expect(result.errors[0].invalidValue).toBe('true');
    });

    it('should reject number values', () => {
        const result = extXEndListValidator.validate(1 as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-ENDLIST value must be a boolean (RFC 8216 Section 4.3.3.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.4)');
        expect(result.errors[0].invalidValue).toBe(1);
    });

    it('should reject null values', () => {
        const result = extXEndListValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-ENDLIST value must be a boolean (RFC 8216 Section 4.3.3.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.4)');
        expect(result.errors[0].invalidValue).toBe(null);
    });

    it('should reject undefined values', () => {
        const result = extXEndListValidator.validate(undefined as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-ENDLIST value must be a boolean (RFC 8216 Section 4.3.3.4: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.4)');
        expect(result.errors[0].invalidValue).toBe(undefined);
    });
}); 