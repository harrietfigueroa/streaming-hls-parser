import { describe, expect, it } from 'vitest';
import { extXMapValidator } from './validator';
import { EXT_X_MAP_PARSED } from './types';
import {
    ExtXMapNotAnObjectError,
    ExtXMapMissingUriError,
    ExtXMapInvalidUriError,
    ExtXMapInvalidByteRangeError
} from './types';

describe('EXT-X-MAP validator', () => {
    describe('valid cases', () => {
        it('should validate URI only', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: undefined,
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate URI with BYTERANGE length only', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: undefined,
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate URI with BYTERANGE length and offset', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 2048,
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate with complex URI', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4?param=value&other=123"' as const,
                BYTERANGE: undefined,
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('invalid cases', () => {
        it('should reject non-object values', () => {
            const result = extXMapValidator.validate(null as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapNotAnObjectError);
        });

        it('should reject string values', () => {
            const result = extXMapValidator.validate('invalid' as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapNotAnObjectError);
        });

        it('should reject number values', () => {
            const result = extXMapValidator.validate(123 as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapNotAnObjectError);
        });

        it('should reject objects without URI property', () => {
            const input = {
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 2048,
                },
            } as any;
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapMissingUriError);
        });

        it('should reject invalid URI format', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: 123 as any, // Not a string
                BYTERANGE: undefined,
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidUriError);
        });

        it('should reject URI without quotes', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: 123 as any, // Not a string
                BYTERANGE: undefined,
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidUriError);
        });

        it('should reject invalid BYTERANGE LENGTH', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: -1, // Negative
                    OFFSET: undefined,
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidByteRangeError);
        });

        it('should reject non-integer BYTERANGE LENGTH', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1.5, // Not integer
                    OFFSET: undefined,
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidByteRangeError);
        });

        it('should reject zero BYTERANGE LENGTH', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 0, // Zero
                    OFFSET: undefined,
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidByteRangeError);
        });

        it('should reject negative BYTERANGE OFFSET', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: -1, // Negative
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidByteRangeError);
        });

        it('should reject non-integer BYTERANGE OFFSET', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 1.5, // Not integer
                },
            };
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBeInstanceOf(ExtXMapInvalidByteRangeError);
        });
    });

    describe('multiple errors', () => {
        it('should collect multiple errors', () => {
            const input = {
                BYTERANGE: {
                    LENGTH: -1,
                    OFFSET: -1,
                },
            } as any;
            const result = extXMapValidator.validate(input);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('error message format', () => {
        it('should include RFC section reference in error messages', () => {
            const result = extXMapValidator.validate(null as any);
            expect(result.errors[0].description).toContain('RFC 8216 Section 4.3.2.5');
            expect(result.errors[0].description).toContain('https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5');
        });
    });
}); 