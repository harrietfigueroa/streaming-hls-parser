import { describe, it, expect } from 'vitest';
import { extXVersionValidator } from './validator';
import { EXTXVERSIONNotNumberError, EXTXVERSIONInvalidIntegerError } from './types';

describe('EXT-X-VERSION validator', () => {
    it('should validate valid integer values', () => {
        const result = extXVersionValidator.validate(1);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);

        const result2 = extXVersionValidator.validate(0);
        expect(result2.isValid).toBe(true);
        expect(result2.errors).toHaveLength(0);

        const result3 = extXVersionValidator.validate(999);
        expect(result3.isValid).toBe(true);
        expect(result3.errors).toHaveLength(0);
    });

    it('should validate zero value', () => {
        const result = extXVersionValidator.validate(0);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate large valid values', () => {
        const result = extXVersionValidator.validate(4294967295);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-number values', () => {
        const result = extXVersionValidator.validate('1' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXVERSIONNotNumberError);

        const result2 = extXVersionValidator.validate(true as any);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toHaveLength(1);
        expect(result2.errors[0]).toBeInstanceOf(EXTXVERSIONNotNumberError);
    });

    it('should reject non-integer values', () => {
        const result = extXVersionValidator.validate(1.5);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXVERSIONInvalidIntegerError);

        const result2 = extXVersionValidator.validate(1.0);
        expect(result2.isValid).toBe(true);
        expect(result2.errors).toHaveLength(0);
    });

    it('should reject negative values', () => {
        const result = extXVersionValidator.validate(-1);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXVERSIONInvalidIntegerError);
    });

    it('should reject values exceeding maximum decimal-integer range', () => {
        const result = extXVersionValidator.validate(4294967296);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXVERSIONInvalidIntegerError);
    });

    it('should reject multiple invalid conditions', () => {
        const result = extXVersionValidator.validate(-1.5 as any);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
}); 