import { describe, expect, it } from 'vitest';
import { extXKeyValidator } from './validator';
import { EXT_X_KEY_PARSED } from './types';
import {
    ExtXKeyNotAnObjectError,
    ExtXKeyMissingMethodError,
    ExtXKeyInvalidMethodError,
    ExtXKeyNoneWithAttributesError,
    ExtXKeyMissingUriError
} from './types';

describe('EXT-X-KEY validator', () => {
    describe('valid cases', () => {
        it('should validate METHOD=NONE', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate METHOD=AES-128 with URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate METHOD=SAMPLE-AES with URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'SAMPLE-AES',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate METHOD=AES-128 with all attributes', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: '0x1234567890abcdef',
                KEYFORMAT: '"identity"' as const,
                KEYFORMATVERSIONS: '"1"' as const,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('invalid cases', () => {
        it('should reject non-object values', () => {
            const result = extXKeyValidator.validate(null as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyNotAnObjectError);
        });

        it('should reject string values', () => {
            const result = extXKeyValidator.validate('invalid' as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyNotAnObjectError);
        });

        it('should reject number values', () => {
            const result = extXKeyValidator.validate(123 as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyNotAnObjectError);
        });

        it('should reject objects without METHOD property', () => {
            const input = {
                URI: '"https://example.com/key"' as const,
                IV: '0x1234567890abcdef',
            } as any;
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyMissingMethodError);
        });

        it('should reject invalid METHOD values', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'INVALID' as any,
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyInvalidMethodError);
        });

        it('should reject METHOD=NONE with URI attribute', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyNoneWithAttributesError);
        });

        it('should reject METHOD=NONE with IV attribute', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: undefined,
                IV: '0x1234567890abcdef',
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyNoneWithAttributesError);
        });

        it('should reject METHOD=NONE with KEYFORMAT attribute', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: '"identity"' as const,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyNoneWithAttributesError);
        });

        it('should reject METHOD=AES-128 without URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyMissingUriError);
        });

        it('should reject METHOD=SAMPLE-AES without URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'SAMPLE-AES',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXKeyMissingUriError);
        });
    });

    describe('multiple errors', () => {
        it('should collect multiple errors', () => {
            const input = {
                METHOD: 'INVALID',
                URI: '"https://example.com/key"' as const,
            } as any;
            const result = extXKeyValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('error message format', () => {
        it('should include RFC section reference in error messages', () => {
            const result = extXKeyValidator.validate(null as any);
            expect(result.errors[0].description).toContain('RFC 8216 Section 4.3.2.4');
            expect(result.errors[0].description).toContain('https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4');
        });
    });
}); 