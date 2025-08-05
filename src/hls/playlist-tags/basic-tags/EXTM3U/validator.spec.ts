import { describe, it, expect } from 'vitest';
import { extM3uValidator } from './validator';
import { EXTM3UNotBooleanError } from './types';

describe('EXTM3U validator', () => {
    it('should validate true value (tag present)', () => {
        const result = extM3uValidator.validate(true);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate false value (tag not present)', () => {
        const result = extM3uValidator.validate(false);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-boolean values', () => {
        const result = extM3uValidator.validate('true' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTM3UNotBooleanError);

        const result2 = extM3uValidator.validate(1 as any);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toHaveLength(1);
        expect(result2.errors[0]).toBeInstanceOf(EXTM3UNotBooleanError);
    });

    it('should reject number values', () => {
        const result = extM3uValidator.validate(0 as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTM3UNotBooleanError);
    });

    it('should reject null values', () => {
        const result = extM3uValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTM3UNotBooleanError);
    });

    it('should reject undefined values', () => {
        const result = extM3uValidator.validate(undefined as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTM3UNotBooleanError);
    });
}); 