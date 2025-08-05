import { describe, expect, it } from 'vitest';
import { extXMapParser } from './parser';
import { extXMapValidator } from './validator';
import { EXT_X_MAP_PARSED } from './types';

describe('EXT-X-MAP validator integration', () => {
    describe('parser-validator integration', () => {
        it('should validate parsed URI only', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXMapValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });

        it('should validate parsed URI with BYTERANGE length only', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXMapValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });

        it('should validate parsed URI with BYTERANGE length and offset', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXMapValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });

        it('should validate parsed with complex URI', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4?param=value&other=123"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const validation = extXMapValidator.validate(parsed);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            }
        });
    });

    describe('invalid parsed values', () => {
        it('should reject parsed object without URI', () => {
            const parsed = {
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 2048,
                },
            } as any;
            const validation = extXMapValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should reject parsed object with invalid URI type', () => {
            const parsed: EXT_X_MAP_PARSED = {
                URI: 123 as any, // Not a string
                BYTERANGE: undefined,
            };
            const validation = extXMapValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should reject parsed object with invalid BYTERANGE', () => {
            const parsed: EXT_X_MAP_PARSED = {
                URI: 'https://example.com/init.mp4',
                BYTERANGE: {
                    LENGTH: -1, // Negative
                    OFFSET: undefined,
                },
            };
            const validation = extXMapValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
    });

    describe('error message consistency', () => {
        it('should provide consistent error messages', () => {
            const parsed: EXT_X_MAP_PARSED = {
                URI: 123 as any, // Not a string
                BYTERANGE: undefined,
            };
            const validation = extXMapValidator.validate(parsed);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);

            // Check that error messages include RFC references
            for (const error of validation.errors) {
                expect(error.description).toContain('RFC 8216 Section 4.3.2.5');
                expect(error.description).toContain('https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5');
            }
        });
    });

    describe('concrete error classes', () => {
        it('should use concrete error classes', () => {
            const parsed: EXT_X_MAP_PARSED = {
                URI: 123 as any, // Not a string
                BYTERANGE: undefined,
            };
            const validation = extXMapValidator.validate(parsed);
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