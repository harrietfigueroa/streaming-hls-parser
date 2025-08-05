import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXKeyParser } from './parser';
import { extXKeyStringifier } from './stringifier';
import { EXT_X_KEY_PARSED } from './types';

describe('EXT-X-KEY generic type inference', () => {
    describe('parser type inference', () => {
        it('should infer correct types for METHOD=AES-128', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"' as const;
            const result = extXKeyParser(input);

            expect(result).toBeDefined();
        });

        it('should infer correct types for METHOD=SAMPLE-AES', () => {
            const input = '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key"' as const;
            const result = extXKeyParser(input);

            expect(result).toBeDefined();
        });

        it('should infer correct types for complex input', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1/2/3"' as const;
            const result = extXKeyParser(input);

            expect(result).toBeDefined();
        });

        it('should handle undefined for invalid inputs', () => {
            const input = '#EXT-X-TARGETDURATION:10' as const;
            const result = extXKeyParser(input);

            expect(result).toBeUndefined();
        });
    });

    describe('stringifier type inference', () => {
        it('should accept EXT_X_KEY_PARSED type', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'NONE',
                URI: undefined,
                IV: undefined,
                KEYFORMAT: undefined,
                KEYFORMATVERSIONS: undefined,
            };

            const result = extXKeyStringifier(input);
            expectTypeOf(result).toBeString();
        });

        it('should accept complex EXT_X_KEY_PARSED type', () => {
            const input: EXT_X_KEY_PARSED = {
                METHOD: 'AES-128',
                URI: '"https://example.com/key"' as const,
                IV: '0x1234567890abcdef',
                KEYFORMAT: '"identity"' as const,
                KEYFORMATVERSIONS: '"1"' as const,
            };

            const result = extXKeyStringifier(input);
            expectTypeOf(result).toBeString();
        });
    });

    describe('round-trip type safety', () => {
        it('should maintain type safety through parse-stringify round-trip', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"' as const;
            const parsed = extXKeyParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expectTypeOf(stringified).toBeString();

                // The stringified result should be a valid input for the parser
                const reparsed = extXKeyParser(stringified);
                expect(reparsed).toBeDefined();
            }
        });

        it('should handle complex types through round-trip', () => {
            const input = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key",IV=0x1234567890abcdef,KEYFORMAT="identity",KEYFORMATVERSIONS="1/2/3"' as const;
            const parsed = extXKeyParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXKeyStringifier(parsed);
                expectTypeOf(stringified).toBeString();

                // The stringified result should be a valid input for the parser
                const reparsed = extXKeyParser(stringified);
                expect(reparsed).toBeDefined();
            }
        });
    });

    describe('conditional types', () => {
        it('should handle optional attributes correctly', () => {
            const input1 = '#EXT-X-KEY:METHOD=NONE' as const;
            const result1 = extXKeyParser(input1);

            expect(result1).toBeDefined();

            const input2 = '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key"' as const;
            const result2 = extXKeyParser(input2);

            expect(result2).toBeDefined();
        });
    });
}); 