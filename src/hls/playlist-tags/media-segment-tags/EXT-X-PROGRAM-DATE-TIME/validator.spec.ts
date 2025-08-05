import { describe, expect, it } from 'vitest';
import { extXProgramDateTimeValidator } from './validator';

describe('EXT-X-PROGRAM-DATE-TIME validator', () => {
    it('should validate valid Date objects', () => {
        const result = extXProgramDateTimeValidator.validate(new Date('2010-02-19T14:54:23.031+08:00'));
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-PROGRAM-DATE-TIME');
    });

    it('should validate Date with UTC timezone', () => {
        const result = extXProgramDateTimeValidator.validate(new Date('2010-02-19T14:54:23.031Z'));
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate Date without timezone', () => {
        const result = extXProgramDateTimeValidator.validate(new Date('2010-02-19T14:54:23.031'));
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-Date values', () => {
        const result = extXProgramDateTimeValidator.validate('2010-02-19T14:54:23.031+08:00' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PROGRAM-DATE-TIME value must be a Date object (RFC 8216 Section 4.3.2.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.3)');
        expect(result.errors[0].invalidValue).toBe('2010-02-19T14:54:23.031+08:00');
    });

    it('should reject null values', () => {
        const result = extXProgramDateTimeValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PROGRAM-DATE-TIME value must be a Date object (RFC 8216 Section 4.3.2.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.3)');
        expect(result.errors[0].invalidValue).toBe(null);
    });

    it('should reject invalid Date objects', () => {
        const invalidDate = new Date('invalid-date');
        const result = extXProgramDateTimeValidator.validate(invalidDate);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PROGRAM-DATE-TIME value must be a valid Date (RFC 8216 Section 4.3.2.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.3)');
        expect(result.errors[0].invalidValue).toBe(invalidDate);
    });

    it('should reject NaN Date objects', () => {
        const nanDate = new Date(NaN);
        const result = extXProgramDateTimeValidator.validate(nanDate);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PROGRAM-DATE-TIME value must be a valid Date (RFC 8216 Section 4.3.2.3: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.3)');
        expect(result.errors[0].invalidValue).toBe(nanDate);
    });
}); 