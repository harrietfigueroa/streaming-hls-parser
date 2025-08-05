import { describe, expect, it } from 'vitest';
import { extXByteRangeValidator } from './validator';

describe('EXT-X-BYTERANGE validator', () => {
    it('should validate valid object with length only', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: 1024 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-BYTERANGE');
    });

    it('should validate valid object with length and offset', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: 1024, OFFSET: 2048 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate zero length', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: 0 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate zero offset', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: 1024, OFFSET: 0 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object values', () => {
        const result = extXByteRangeValidator.validate('1024' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE value must be an object (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toBe('1024');
    });

    it('should reject null values', () => {
        const result = extXByteRangeValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE value must be an object (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toBe(null);
    });

    it('should reject object without LENGTH property', () => {
        const result = extXByteRangeValidator.validate({ OFFSET: 2048 } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE object must have a LENGTH property (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toEqual({ OFFSET: 2048 });
    });

    it('should reject non-number LENGTH', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: '1024' } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE LENGTH must be a number (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toEqual({ LENGTH: '1024' });
    });

    it('should reject negative LENGTH', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: -1024 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE LENGTH must be non-negative (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toEqual({ LENGTH: -1024 });
    });

    it('should reject non-number OFFSET', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: 1024, OFFSET: '2048' } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE OFFSET must be a number when present (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toEqual({ LENGTH: 1024, OFFSET: '2048' });
    });

    it('should reject negative OFFSET', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: 1024, OFFSET: -2048 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE OFFSET must be non-negative when present (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[0].invalidValue).toEqual({ LENGTH: 1024, OFFSET: -2048 });
    });

    it('should collect multiple errors', () => {
        const result = extXByteRangeValidator.validate({ LENGTH: -1024, OFFSET: -2048 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0].description).toBe('EXT-X-BYTERANGE LENGTH must be non-negative (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
        expect(result.errors[1].description).toBe('EXT-X-BYTERANGE OFFSET must be non-negative when present (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)');
    });
}); 