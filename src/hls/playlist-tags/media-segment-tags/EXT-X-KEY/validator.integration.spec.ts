import { describe, expect, it } from 'vitest';
import { extXKeyParser } from './parser';
import { extXKeyValidator } from './validator';
import { EXT_X_KEY_PARSED } from './types';

describe('EXT-X-KEY validator integration', () => {
    describe('parser-validator integration', () => {
        it('should validate parsed METHOD=NONE', () => {
            const input = '#EXT-X-KEY:METHOD=NONE';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXKeyValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });

        it('should validate parsed METHOD=AES-128 with URI', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXKeyValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });

        it('should validate parsed METHOD=SAMPLE-AES with URI', () => {
            const input = '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXKeyValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });

        it('should validate parsed METHOD=AES-128 with all attributes', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXKeyValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });
    });

    describe('invalid parsed values', () => {
        it('should reject parsed METHOD=NONE with URI', () => {
            const parsed: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const validation = extXKeyValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should reject parsed METHOD=AES-128 without URI', () => {
            const parsed: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const validation = extXKeyValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should reject parsed METHOD=SAMPLE-AES without URI', () => {
            const parsed: EXT_X_KEY_PARSED = {
                METHOD: 'SAMPLE-AES',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const validation = extXKeyValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
    });

    describe('error message consistency', () => {
        it('should provide consistent error messages', () => {
            const parsed: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const validation = extXKeyValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);

            // Check that error messages include RFC references
            for (const error of validation.errors) {
                expect(error.description).toContain('RFC 8216 Section 4.3.2.4');
                expect(error.description).toContain('https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4');
            }
        });
    });

    describe('concrete error classes', () => {
        it('should use concrete error classes', () => {
            const parsed: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const validation = extXKeyValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);

            // Check that errors are concrete class instances
            for (const error of validation.errors) {
                expect(error).toHaveProperty('type');
                expect(error).toHaveProperty('description');
                expect(error).toHaveProperty('tagName');
                expect(error).toHaveProperty('invalidValue');
            }
        });
    });
}); 