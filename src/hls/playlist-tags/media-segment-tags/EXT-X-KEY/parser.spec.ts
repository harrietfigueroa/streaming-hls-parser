import { describe, expect, it } from 'vitest';
import { extXKeyParser } from './parser';
import { EXT_X_KEY_PARSED } from './types';

describe('EXT-X-KEY parser', () => {
    describe('valid inputs', () => {
        it('should parse METHOD=NONE', () => {
            const result = extXKeyParser('#EXT-X-KEY:METHOD=NONE');
            expect(result).toEqual({
                METHOD: 'NONE',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            });
        });

        it('should parse METHOD=AES-128 with URI', () => {
            const result = extXKeyParser('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"');
            expect(result).toEqual({
                METHOD: 'AES-128',
                URI: 'https://example.com/key',
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            });
        });

        it('should parse METHOD=AES-128 with all attributes', () => {
            const result = extXKeyParser('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1"');
            expect(result).toEqual({
                METHOD: 'AES-128',
                URI: 'https://example.com/key',
                IV: '0x1234567890abcdef',
                KEYFORMAT: 'identity',
                KEYFORMATVERSIONS: '1',
            });
        });

        it('should parse METHOD=SAMPLE-AES with URI', () => {
            const result = extXKeyParser('#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"');
            expect(result).toEqual({
                METHOD: 'SAMPLE-AES',
                URI: 'https://example.com/key',
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            });
        });

        it('should parse METHOD=SAMPLE-AES with URI', () => {
            const result = extXKeyParser('#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"');
            expect(result).toEqual({
                METHOD: 'SAMPLE-AES',
                URI: 'https://example.com/key',
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            });
        });
    });

    describe('invalid inputs', () => {
        it('should return undefined for non-EXT-X-KEY tags', () => {
            expect(extXKeyParser('#EXT-X-TARGETDURATION:10')).toBeUndefined();
            expect(extXKeyParser('#EXTINF:10.0,')).toBeUndefined();
            expect(extXKeyParser('')).toBeUndefined();
            expect(extXKeyParser(undefined as any)).toBeUndefined();
        });

        it('should return undefined for malformed EXT-X-KEY tags', () => {
            expect(extXKeyParser('#EXT-X-KEY:')).toBeUndefined();
            expect(extXKeyParser('#EXT-X-KEY:METHOD')).toBeUndefined();
            expect(extXKeyParser('#EXT-X-KEY:METHOD=')).toBeUndefined();
        });

        it('should return undefined for invalid attribute format', () => {
            expect(extXKeyParser('#EXT-X-KEY:METHOD=NONE,INVALID')).toBeUndefined();
            expect(extXKeyParser('#EXT-X-KEY:METHOD=NONE,=')).toBeUndefined();
        });
    });

    describe('generic type inference', () => {
        it('should have correct type inference for valid inputs', () => {
            const result = extXKeyParser('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"' as const);
            expect(result).toBeDefined();
            if (result) {
                // TypeScript should infer the correct types
                expect(typeof result.METHOD).toBe('string');
                expect(typeof result.URI).toBe('string');
            }
        });

        it('should handle complex generic types', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1"' as const;
            const result = extXKeyParser(input);
            expect(result).toBeDefined();
            if (result) {
                expect(result.METHOD).toBe('AES-128');
                expect(result.URI).toBe('https://example.com/key');
                expect(result.IV).toBe('0x1234567890abcdef');
                expect(result.KEYFORMAT).toBe('identity');
                expect(result.KEYFORMATVERSIONS).toBe('1');
            }
        });
    });
}); 