import { describe, expect, it } from 'vitest';
import { extXTargetDurationValidator } from './validator';

describe('EXT-X-TARGETDURATION validator', () => {
    it('should validate valid integer values', () => {
        const result = extXTargetDurationValidator.validate(10);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-TARGETDURATION');
    });

    it('should validate zero value', () => {
        const result = extXTargetDurationValidator.validate(0);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate large valid values', () => {
        const result = extXTargetDurationValidator.validate(4294967295);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-number values', () => {
        const result = extXTargetDurationValidator.validate('10' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-TARGETDURATION value must be a number (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)');
        expect(result.errors[0].invalidValue).toBe('10');
    });

    it('should reject non-integer values', () => {
        const result = extXTargetDurationValidator.validate(10.5);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-TARGETDURATION value must be a decimal-integer (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)');
        expect(result.errors[0].invalidValue).toBe(10.5);
    });

    it('should reject negative values', () => {
        const result = extXTargetDurationValidator.validate(-1);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-TARGETDURATION value must be non-negative (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)');
        expect(result.errors[0].invalidValue).toBe(-1);
    });

    it('should reject values exceeding maximum decimal-integer range', () => {
        const result = extXTargetDurationValidator.validate(4294967296);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-TARGETDURATION value exceeds maximum decimal-integer range (0 to 2^32-1) (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)');
        expect(result.errors[0].invalidValue).toBe(4294967296);
    });

    it('should reject multiple invalid conditions', () => {
        const result = extXTargetDurationValidator.validate(-10.5);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0].description).toBe('EXT-X-TARGETDURATION value must be a decimal-integer (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)');
        expect(result.errors[1].description).toBe('EXT-X-TARGETDURATION value must be non-negative (RFC 8216 Section 4.3.3.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1)');
    });
}); 