import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXMapParser, extXMapStringifier } from './index';
import { EXT_X_MAP_PARSED } from './types';

describe('EXT-X-MAP generic type inference', () => {
    describe('parser type inference', () => {
        it('should infer correct types for URI only', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4"' as const;
            const result = extXMapParser(input);

            expect(result).toBeDefined();
            if (result) {
                expectTypeOf(result.URI).toBeString();
            }
        });

        it('should infer correct types for URI with BYTERANGE', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024"' as const;
            const result = extXMapParser(input);

            expect(result).toBeDefined();
            if (result) {
                expectTypeOf(result.URI).toBeString();
                if (result.BYTERANGE) {
                    expectTypeOf(result.BYTERANGE.LENGTH).toBeNumber();
                }
            }
        });

        it('should infer correct types for URI with BYTERANGE and offset', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"' as const;
            const result = extXMapParser(input);

            expect(result).toBeDefined();
            if (result) {
                expectTypeOf(result.URI).toBeString();
                if (result.BYTERANGE) {
                    expectTypeOf(result.BYTERANGE.LENGTH).toBeNumber();
                    expect(result.BYTERANGE.OFFSET).toBe(2048);
                }
            }
        });

        it('should handle undefined for invalid inputs', () => {
            const input = '#EXT-X-TARGETDURATION:10' as const;
            const result = extXMapParser(input);

            expect(result).toBeUndefined();
        });
    });

    describe('stringifier type inference', () => {
        it('should accept EXT_X_MAP_PARSED type', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: undefined,
            };

            const result = extXMapStringifier(input);
            expectTypeOf(result).toBeString();
        });

        it('should accept complex EXT_X_MAP_PARSED type', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 2048,
                },
            };

            const result = extXMapStringifier(input);
            expectTypeOf(result).toBeString();
        });
    });

    describe('round-trip type safety', () => {
        it('should maintain type safety through parse-stringify round-trip', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4"' as const;
            const parsed = extXMapParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expectTypeOf(stringified).toBeString();

                // The stringified result should be a valid input for the parser
                const reparsed = extXMapParser(stringified);
                expect(reparsed).toBeDefined();
            }
        });

        it('should handle complex types through round-trip', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"' as const;
            const parsed = extXMapParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expectTypeOf(stringified).toBeString();

                // The stringified result should be a valid input for the parser
                const reparsed = extXMapParser(stringified);
                expect(reparsed).toBeDefined();
            }
        });
    });

    describe('conditional types', () => {
        it('should handle optional attributes correctly', () => {
            const input1 = '#EXT-X-MAP:URI="https://example.com/init.mp4"' as const;
            const result1 = extXMapParser(input1);

            expect(result1).toBeDefined();
            if (result1) {
                expectTypeOf(result1.URI).toBeString();
                expect(result1.BYTERANGE).toBeUndefined();
            }

            const input2 = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024"' as const;
            const result2 = extXMapParser(input2);

            expect(result2).toBeDefined();
            if (result2) {
                expectTypeOf(result2.URI).toBeString();
                expect(result2.BYTERANGE).toBeDefined();
            }
        });
    });
}); 