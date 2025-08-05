import { describe, expect, it } from 'vitest';
import { extXKeyParser } from './parser';
import { extXKeyStringifier } from './stringifier';
import { EXT_X_KEY_PARSED } from './types';

describe('EXT-X-KEY integration', () => {
    describe('parser-stringifier round-trip', () => {
        it('should parse and stringify METHOD=NONE', () => {
            const input = '#EXT-X-KEY:METHOD=NONE';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify METHOD=AES-128 with URI', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify METHOD=SAMPLE-AES with URI', () => {
            const input = '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify METHOD=AES-128 with all attributes', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify METHOD=AES-128 with only IV', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify METHOD=AES-128 with only KEYFORMAT', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",KEYFORMAT="identity"';
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });
    });

    describe('type safety through round-trip', () => {
        it('should maintain type safety for METHOD=NONE', () => {
            const input = '#EXT-X-KEY:METHOD=NONE' as const;
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.METHOD).toBe('NONE');
                expect(parsed.URI).toBeUndefined();
                expect(parsed.IV).toBeUndefined();
                expect(parsed.KEYFORMAT).toBeUndefined();
                expect(parsed.KEYFORMATVERSIONS).toBeUndefined();
            }
        });

        it('should maintain type safety for METHOD=AES-128', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"' as const;
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.METHOD).toBe('AES-128');
                expect(parsed.URI).toBe('https://example.com/key');
                expect(parsed.IV).toBeUndefined();
                expect(parsed.KEYFORMAT).toBeUndefined();
                expect(parsed.KEYFORMATVERSIONS).toBeUndefined();
            }
        });

        it('should maintain type safety for METHOD=SAMPLE-AES', () => {
            const input = '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"' as const;
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.METHOD).toBe('SAMPLE-AES');
                expect(parsed.URI).toBe('https://example.com/key');
                expect(parsed.IV).toBeUndefined();
                expect(parsed.KEYFORMAT).toBeUndefined();
                expect(parsed.KEYFORMATVERSIONS).toBeUndefined();
            }
        });
    });

    describe('complex generic types', () => {
        it('should handle complex input with all attributes', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1/2/3"' as const;
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.METHOD).toBe('AES-128');
                expect(parsed.URI).toBe('https://example.com/key');
                expect(parsed.IV).toBe('0x1234567890abcdef');
                expect(parsed.KEYFORMAT).toBe('identity');
                expect(parsed.KEYFORMATVERSIONS).toBe('1/2/3');

                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should handle special characters in URI', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key?param=value&other=123"' as const;
            const parsed = extXKeyParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.METHOD).toBe('AES-128');
                expect(parsed.URI).toBe('https://example.com/key?param=value&other=123');

                const stringified = extXKeyStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });
    });
}); 