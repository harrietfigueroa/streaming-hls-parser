import { describe, it, expect } from 'vitest';
import { extXIndependentSegmentsValidator } from './validator';
import { EXTXINDEPENDENTSEGMENTSNotBooleanError } from './types';

describe('EXT-X-INDEPENDENT-SEGMENTS validator', () => {
    it('should validate true value (tag present)', () => {
        const result = extXIndependentSegmentsValidator.validate(true);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate false value (tag not present)', () => {
        const result = extXIndependentSegmentsValidator.validate(false);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-boolean values', () => {
        const result = extXIndependentSegmentsValidator.validate('true' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXINDEPENDENTSEGMENTSNotBooleanError);

        const result2 = extXIndependentSegmentsValidator.validate(1 as any);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toHaveLength(1);
        expect(result2.errors[0]).toBeInstanceOf(EXTXINDEPENDENTSEGMENTSNotBooleanError);
    });

    it('should reject number values', () => {
        const result = extXIndependentSegmentsValidator.validate(0 as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXINDEPENDENTSEGMENTSNotBooleanError);
    });

    it('should reject null values', () => {
        const result = extXIndependentSegmentsValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXINDEPENDENTSEGMENTSNotBooleanError);
    });

    it('should reject undefined values', () => {
        const result = extXIndependentSegmentsValidator.validate(undefined as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXINDEPENDENTSEGMENTSNotBooleanError);
    });
}); 