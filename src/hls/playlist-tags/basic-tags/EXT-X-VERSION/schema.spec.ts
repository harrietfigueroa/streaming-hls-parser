import { describe, expect, it } from 'vitest';
import { EXT_X_VERSION_CODEC } from './schema';

describe('EXT-X-VERSION schema', () => {
    describe('EXT_X_VERSION_CODEC decoding', () => {
        it('should decode a valid EXT-X-VERSION tag with version 1', () => {
            const tag = '#EXT-X-VERSION:1';
            const result = EXT_X_VERSION_CODEC.decode(tag);
            expect(result).toBe(1);
        });

        it('should decode a valid EXT-X-VERSION tag with version 7', () => {
            const tag = '#EXT-X-VERSION:7';
            const result = EXT_X_VERSION_CODEC.decode(tag);
            expect(result).toBe(7);
        });

        it('should decode a valid EXT-X-VERSION tag with version 3', () => {
            const tag = '#EXT-X-VERSION:3';
            const result = EXT_X_VERSION_CODEC.decode(tag);
            expect(result).toBe(3);
        });

        it('should decode a valid EXT-X-VERSION tag with version 6', () => {
            const tag = '#EXT-X-VERSION:6';
            const result = EXT_X_VERSION_CODEC.decode(tag);
            expect(result).toBe(6);
        });
    });

    describe('EXT_X_VERSION_CODEC encoding', () => {
        it('should encode a valid EXT-X-VERSION tag with version 1', () => {
            const input = 1;
            const result = EXT_X_VERSION_CODEC.encode(input);
            expect(result).toBe('#EXT-X-VERSION:1');
        });

        it('should encode a valid EXT-X-VERSION tag with version 7', () => {
            const input = 7;
            const result = EXT_X_VERSION_CODEC.encode(input);
            expect(result).toBe('#EXT-X-VERSION:7');
        });

        it('should encode a valid EXT-X-VERSION tag with version 3', () => {
            const input = 3;
            const result = EXT_X_VERSION_CODEC.encode(input);
            expect(result).toBe('#EXT-X-VERSION:3');
        });

        it('should encode a valid EXT-X-VERSION tag with version 6', () => {
            const input = 6;
            const result = EXT_X_VERSION_CODEC.encode(input);
            expect(result).toBe('#EXT-X-VERSION:6');
        });
    });

    describe('EXT_X_VERSION_CODEC validation', () => {
        it('should reject version 0 (below minimum)', () => {
            const tag = '#EXT-X-VERSION:0';
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject version 8 (above maximum)', () => {
            const tag = '#EXT-X-VERSION:8';
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject negative versions', () => {
            const tag = '#EXT-X-VERSION:-1';
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject non-integer versions', () => {
            const tag = '#EXT-X-VERSION:1.5';
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject non-numeric values', () => {
            const tag = '#EXT-X-VERSION:abc';
            // @ts-expect-error
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject empty version', () => {
            const tag = '#EXT-X-VERSION:';
            // @ts-expect-error
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject missing colon', () => {
            const tag = '#EXT-X-VERSION1';
            // @ts-expect-error
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should reject wrong tag name', () => {
            const tag = '#EXT-X-VERSIONS:1';
            // @ts-expect-error
            expect(() => EXT_X_VERSION_CODEC.decode(tag)).toThrow();
        });

        it('should accept all valid versions (1-7)', () => {
            const validVersions = [1, 2, 3, 4, 5, 6, 7];

            validVersions.forEach((version) => {
                const tag = `#EXT-X-VERSION:${version}` as const;
                expect(() => EXT_X_VERSION_CODEC.decode(tag)).not.toThrow();
                const result = EXT_X_VERSION_CODEC.decode(tag);
                expect(result).toBe(version);
            });
        });

        it('should reject encoding invalid versions', () => {
            expect(() => EXT_X_VERSION_CODEC.encode(0)).toThrow();
            expect(() => EXT_X_VERSION_CODEC.encode(8)).toThrow();
            expect(() => EXT_X_VERSION_CODEC.encode(-1)).toThrow();
            expect(() => EXT_X_VERSION_CODEC.encode(1.5)).toThrow();
        });
    });

    describe('EXT_X_VERSION_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle with version 1', () => {
            const original = 1;

            const encoded = EXT_X_VERSION_CODEC.encode(original);
            const decoded = EXT_X_VERSION_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should maintain data integrity through encode/decode cycle with version 7', () => {
            const original = 7;

            const encoded = EXT_X_VERSION_CODEC.encode(original);
            const decoded = EXT_X_VERSION_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should maintain data integrity through encode/decode cycle with version 4', () => {
            const original = 4;

            const encoded = EXT_X_VERSION_CODEC.encode(original);
            const decoded = EXT_X_VERSION_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should maintain data integrity for all valid versions', () => {
            const validVersions = [1, 2, 3, 4, 5, 6, 7];

            validVersions.forEach((version) => {
                const encoded = EXT_X_VERSION_CODEC.encode(version);
                const decoded = EXT_X_VERSION_CODEC.decode(encoded);
                expect(decoded).toBe(version);
            });
        });
    });
});
