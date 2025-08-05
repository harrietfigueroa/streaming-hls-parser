import { describe, expect, it } from 'vitest';
import { extXMapParser } from './parser';
import { EXT_X_MAP_PARSED } from './types';

describe('EXT-X-MAP parser', () => {
    describe('valid inputs', () => {
        it('should parse URI only', () => {
            const result = extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4"');
            expect(result).toEqual({
                URI: 'https://example.com/init.mp4',
                BYTERANGE: undefined,
            });
        });

        it('should parse URI with BYTERANGE length only', () => {
            const result = extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024"');
            expect(result).toEqual({
                URI: 'https://example.com/init.mp4',
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: undefined,
                },
            });
        });

        it('should parse URI with BYTERANGE length and offset', () => {
            const result = extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"');
            expect(result).toEqual({
                URI: 'https://example.com/init.mp4',
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 2048,
                },
            });
        });

        it('should parse with complex URI', () => {
            const result = extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4?param=value&other=123"');
            expect(result).toEqual({
                URI: 'https://example.com/init.mp4?param=value&other=123',
                BYTERANGE: undefined,
            });
        });
    });

    describe('invalid inputs', () => {
        it('should return undefined for non-EXT-X-MAP tags', () => {
            expect(extXMapParser('#EXT-X-TARGETDURATION:10')).toBeUndefined();
            expect(extXMapParser('#EXTINF:10.0,')).toBeUndefined();
            expect(extXMapParser('')).toBeUndefined();
            expect(extXMapParser(undefined as any)).toBeUndefined();
        });

        it('should return undefined for malformed EXT-X-MAP tags', () => {
            expect(extXMapParser('#EXT-X-MAP:')).toBeUndefined();
            expect(extXMapParser('#EXT-X-MAP:URI')).toBeUndefined();
            expect(extXMapParser('#EXT-X-MAP:URI=')).toBeUndefined();
        });

        it('should return undefined for invalid attribute format', () => {
            expect(extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4",INVALID')).toBeUndefined();
            expect(extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4",=')).toBeUndefined();
        });

        it('should return undefined for invalid BYTERANGE format', () => {
            expect(extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="invalid"')).toBeUndefined();
            expect(extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="@123"')).toBeUndefined();
        });
    });

    describe('generic type inference', () => {
        it('should have correct type inference for valid inputs', () => {
            const result = extXMapParser('#EXT-X-MAP:URI="https://example.com/init.mp4"' as const);
            expect(result).toBeDefined();
            if (result) {
                // TypeScript should infer the correct types
                expect(typeof result.URI).toBe('string');
                expect(result.BYTERANGE).toBeUndefined();
            }
        });

        it('should handle complex generic types', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"' as const;
            const result = extXMapParser(input);
            expect(result).toBeDefined();
            if (result) {
                expect(result.URI).toBe('https://example.com/init.mp4');
                expect(result.BYTERANGE?.LENGTH).toBe(1024);
                expect(result.BYTERANGE?.OFFSET).toBe(2048);
            }
        });
    });
}); 