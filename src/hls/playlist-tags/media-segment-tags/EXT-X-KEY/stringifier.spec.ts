import { describe, expect, it } from 'vitest';
import { extXKeyStringifier } from './stringifier';
import { EXT_X_KEY_PARSED } from './types';

describe('EXT-X-KEY stringifier', () => {
    describe('valid inputs', () => {
        it('should stringify METHOD=NONE', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=NONE');
        });

        it('should stringify METHOD=AES-128 with URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"');
        });

        it('should stringify METHOD=AES-128 with all attributes', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: '0x1234567890abcdef',
                KEYFORMAT: '"identity"' as const,
                KEYFORMATVERSIONS: '"1"' as const,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1"');
        });

        it('should stringify METHOD=SAMPLE-AES with URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'SAMPLE-AES',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"');
        });

        it('should stringify with only METHOD and IV', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: '0x1234567890abcdef',
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef');
        });

        it('should stringify with only METHOD and KEYFORMAT', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: undefined,
                KEYFORMAT: '"identity"' as const,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",KEYFORMAT="identity"');
        });
    });

    describe('edge cases', () => {
        it('should handle empty string values', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '""' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=AES-128,URI=""');
        });

        it('should handle special characters in URI', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key?param=value&other=123"' as const,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };
            const result = extXKeyStringifier(input);
            expect(result).toBe('#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key?param=value&other=123"');
        });
    });
}); 