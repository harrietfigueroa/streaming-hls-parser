import { describe, expect, it } from 'vitest';
import { extXMapParser } from './parser';
import { extXMapStringifier } from './stringifier';
import { EXT_X_MAP_PARSED } from './types';

describe('EXT-X-MAP integration', () => {
    describe('parser-stringifier round-trip', () => {
        it('should parse and stringify URI only', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify URI with BYTERANGE length only', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify URI with BYTERANGE length and offset', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify with complex URI', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4?param=value&other=123"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should parse and stringify with large numbers', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1048576@2097152"';
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });
    });

    describe('type safety through round-trip', () => {
        it('should maintain type safety for URI only', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4"' as const;
            const parsed = extXMapParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.URI).toBe('https://example.com/init.mp4');
                expect(parsed.BYTERANGE).toBeUndefined();
            }
        });

        it('should maintain type safety for URI with BYTERANGE', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4",BYTERANGE="1024@2048"' as const;
            const parsed = extXMapParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.URI).toBe('https://example.com/init.mp4');
                expect(parsed.BYTERANGE?.LENGTH).toBe(1024);
                expect(parsed.BYTERANGE?.OFFSET).toBe(2048);
            }
        });
    });

    describe('complex generic types', () => {
        it('should handle complex input with all attributes', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4?param=value&other=123",BYTERANGE="1048576@2097152"' as const;
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.URI).toBe('https://example.com/init.mp4?param=value&other=123');
                expect(parsed.BYTERANGE?.LENGTH).toBe(1048576);
                expect(parsed.BYTERANGE?.OFFSET).toBe(2097152);

                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });

        it('should handle special characters in URI', () => {
            const input = '#EXT-X-MAP:URI="https://example.com/init.mp4?param=value&other=123"' as const;
            const parsed = extXMapParser(input);
            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.URI).toBe('https://example.com/init.mp4?param=value&other=123');

                const stringified = extXMapStringifier(parsed);
                expect(stringified).toBe(input);
            }
        });
    });
}); 