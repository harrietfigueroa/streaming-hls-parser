import { describe, expect, it } from 'vitest';
import { extinfValidator } from './validator';

describe('EXTINF validator', () => {
    it('should validate valid object with duration only', () => {
        const result = extinfValidator.validate({ DURATION: 10.5 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXTINF');
    });

    it('should validate valid object with duration and title', () => {
        const result = extinfValidator.validate({ DURATION: 8.2, TITLE: 'Segment Title' });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate zero duration', () => {
        const result = extinfValidator.validate({ DURATION: 0 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate integer duration', () => {
        const result = extinfValidator.validate({ DURATION: 15 });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object values', () => {
        const result = extinfValidator.validate('invalid' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXTINF value must be an object (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[0].invalidValue).toBe('invalid');
    });

    it('should reject null values', () => {
        const result = extinfValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXTINF value must be an object (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[0].invalidValue).toBe(null);
    });

    it('should reject object without DURATION property', () => {
        const result = extinfValidator.validate({ TITLE: 'Segment' } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXTINF object must have a DURATION property (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[0].invalidValue).toEqual({ TITLE: 'Segment' });
    });

    it('should reject non-number DURATION', () => {
        const result = extinfValidator.validate({ DURATION: '10' } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXTINF DURATION must be a number (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[0].invalidValue).toEqual({ DURATION: '10' });
    });

    it('should reject negative DURATION', () => {
        const result = extinfValidator.validate({ DURATION: -5.2 });
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXTINF DURATION must be non-negative (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[0].invalidValue).toEqual({ DURATION: -5.2 });
    });

    it('should reject non-string TITLE', () => {
        const result = extinfValidator.validate({ DURATION: 10, TITLE: 42 } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXTINF TITLE must be a string when present (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[0].invalidValue).toEqual({ DURATION: 10, TITLE: 42 });
    });

    it('should collect multiple errors', () => {
        const result = extinfValidator.validate({ DURATION: -5, TITLE: 42 } as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0].description).toBe('EXTINF DURATION must be non-negative (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
        expect(result.errors[1].description).toBe('EXTINF TITLE must be a string when present (RFC 8216 Section 4.3.2.1: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.1)');
    });
}); 