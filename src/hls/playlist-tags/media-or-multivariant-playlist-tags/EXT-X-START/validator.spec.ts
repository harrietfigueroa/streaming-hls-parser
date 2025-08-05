import { describe, it, expect } from 'vitest';
import { extXStartValidator } from './validator';
import {
    EXTXSTARTNotObjectError,
    EXTXSTARTMissingTimeOffsetError,
    EXTXSTARTInvalidTimeOffsetError,
    EXTXSTARTInvalidPreciseError
} from './types';

describe('EXT-X-START validator', () => {
    it('should validate valid object with TIME-OFFSET only', () => {
        const input = {
            'TIME-OFFSET': 10.5
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate valid object with TIME-OFFSET and PRECISE=YES', () => {
        const input = {
            'TIME-OFFSET': 10.5,
            PRECISE: 'YES' as const
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate valid object with TIME-OFFSET and PRECISE=NO', () => {
        const input = {
            'TIME-OFFSET': 10.5,
            PRECISE: 'NO' as const
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate negative TIME-OFFSET', () => {
        const input = {
            'TIME-OFFSET': -10.5
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object values', () => {
        const result = extXStartValidator.validate('string' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXSTARTNotObjectError);

        const result2 = extXStartValidator.validate(123 as any);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toHaveLength(1);
        expect(result2.errors[0]).toBeInstanceOf(EXTXSTARTNotObjectError);
    });

    it('should reject null values', () => {
        const result = extXStartValidator.validate(null as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXSTARTNotObjectError);
    });

    it('should reject missing TIME-OFFSET', () => {
        const input = {
            PRECISE: 'YES' as const
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXSTARTMissingTimeOffsetError);
    });

    it('should reject invalid TIME-OFFSET type', () => {
        const input = {
            'TIME-OFFSET': '10.5'
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXSTARTInvalidTimeOffsetError);
    });

    it('should reject invalid PRECISE value', () => {
        const input = {
            'TIME-OFFSET': 10.5,
            PRECISE: 'MAYBE'
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBeInstanceOf(EXTXSTARTInvalidPreciseError);
    });

    it('should reject multiple invalid conditions', () => {
        const input = {
            'TIME-OFFSET': 'abc',
            PRECISE: 'INVALID'
        };
        const result = extXStartValidator.validate(input as any);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
}); 