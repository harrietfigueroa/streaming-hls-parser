import { describe, expect, it } from 'vitest';
import { extXMapStringifier } from './stringifier';
import { EXT_X_MAP_PARSED } from './types';

describe('EXT-X-MAP stringifier', () => {
    describe('valid inputs', () => {
        it('should stringify URI only', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: undefined,
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI="https://example.com/init.mp4"');
        });

        it('should stringify URI with BYTERANGE length only', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: undefined,
                },
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024"');
        });

        it('should stringify URI with BYTERANGE length and offset', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 2048,
                },
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"');
        });

        it('should stringify with complex URI', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4?param=value&other=123"' as const,
                BYTERANGE: undefined,
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI="https://example.com/init.mp4?param=value&other=123"');
        });

        it('should stringify with large numbers', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1048576,
                    OFFSET: 2097152,
                },
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1048576@2097152"');
        });
    });

    describe('edge cases', () => {
        it('should handle zero offset', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '"https://example.com/init.mp4"' as const,
                BYTERANGE: {
                    LENGTH: 1024,
                    OFFSET: 0,
                },
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@0"');
        });

        it('should handle empty URI', () => {
            const input: EXT_X_MAP_PARSED = {
                URI: '""' as const,
                BYTERANGE: undefined,
            };
            const result = extXMapStringifier(input);
            expect(result).toBe('#EXT-X-MAP:URI=""');
        });
    });
}); 