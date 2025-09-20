import { describe, expect, it } from 'vitest';
import { EXT_X_MEDIA_SEQUENCE_CODEC } from './schema';

describe('EXT-X-MEDIA-SEQUENCE schema', () => {
    describe('EXT_X_MEDIA_SEQUENCE_CODEC decoding', () => {
        it('should decode a valid EXT-X-MEDIA-SEQUENCE tag with sequence 0', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:0';
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag);
            expect(result).toBe(0);
        });

        it('should decode a valid EXT-X-MEDIA-SEQUENCE tag with sequence 1', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:1';
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag);
            expect(result).toBe(1);
        });

        it('should decode a valid EXT-X-MEDIA-SEQUENCE tag with large sequence', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:999999';
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag);
            expect(result).toBe(999999);
        });

        it('should decode a valid EXT-X-MEDIA-SEQUENCE tag with sequence 100', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:100';
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag);
            expect(result).toBe(100);
        });
    });

    describe('EXT_X_MEDIA_SEQUENCE_CODEC encoding', () => {
        it('should encode a valid EXT-X-MEDIA-SEQUENCE tag with sequence 0', () => {
            const input = 0;
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.encode(input);
            expect(result).toBe('#EXT-X-MEDIA-SEQUENCE:0');
        });

        it('should encode a valid EXT-X-MEDIA-SEQUENCE tag with sequence 1', () => {
            const input = 1;
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.encode(input);
            expect(result).toBe('#EXT-X-MEDIA-SEQUENCE:1');
        });

        it('should encode a valid EXT-X-MEDIA-SEQUENCE tag with large sequence', () => {
            const input = 999999;
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.encode(input);
            expect(result).toBe('#EXT-X-MEDIA-SEQUENCE:999999');
        });

        it('should encode a valid EXT-X-MEDIA-SEQUENCE tag with sequence 100', () => {
            const input = 100;
            const result = EXT_X_MEDIA_SEQUENCE_CODEC.encode(input);
            expect(result).toBe('#EXT-X-MEDIA-SEQUENCE:100');
        });
    });

    describe('EXT_X_MEDIA_SEQUENCE_CODEC validation', () => {
        it('should reject negative sequence numbers', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:-1';
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).toThrow();
        });

        it('should reject non-integer sequence numbers', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:1.5';
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).toThrow();
        });

        it('should reject non-numeric values', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:abc';
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).toThrow();
        });

        it('should reject empty sequence', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE:';
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).toThrow();
        });

        it('should reject missing colon', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCE1';
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).toThrow();
        });

        it('should reject wrong tag name', () => {
            const tag = '#EXT-X-MEDIA-SEQUENCES:1';
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).toThrow();
        });

        it('should accept all valid sequence numbers (0 and positive integers)', () => {
            const validSequences = [0, 1, 2, 10, 100, 1000, 999999];

            validSequences.forEach((sequence) => {
                const tag = `#EXT-X-MEDIA-SEQUENCE:${sequence}` as const;
                expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag)).not.toThrow();
                const result = EXT_X_MEDIA_SEQUENCE_CODEC.decode(tag);
                expect(result).toBe(sequence);
            });
        });

        it('should reject encoding negative sequence numbers', () => {
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.encode(-1)).toThrow();
        });

        it('should reject encoding non-integer sequence numbers', () => {
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.encode(1.5)).toThrow();
        });

        it('should reject encoding non-numeric values', () => {
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.encode('1')).toThrow();
            // @ts-expect-error
            expect(() => EXT_X_MEDIA_SEQUENCE_CODEC.encode({})).toThrow();
        });
    });

    describe('EXT_X_MEDIA_SEQUENCE_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle with sequence 0', () => {
            const original = 0;

            const encoded = EXT_X_MEDIA_SEQUENCE_CODEC.encode(original);
            const decoded = EXT_X_MEDIA_SEQUENCE_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should maintain data integrity through encode/decode cycle with sequence 1', () => {
            const original = 1;

            const encoded = EXT_X_MEDIA_SEQUENCE_CODEC.encode(original);
            const decoded = EXT_X_MEDIA_SEQUENCE_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should maintain data integrity through encode/decode cycle with large sequence', () => {
            const original = 999999;

            const encoded = EXT_X_MEDIA_SEQUENCE_CODEC.encode(original);
            const decoded = EXT_X_MEDIA_SEQUENCE_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should maintain data integrity for all valid sequence numbers', () => {
            const validSequences = [0, 1, 2, 10, 100, 1000, 999999];

            validSequences.forEach((sequence) => {
                const encoded = EXT_X_MEDIA_SEQUENCE_CODEC.encode(sequence);
                const decoded = EXT_X_MEDIA_SEQUENCE_CODEC.decode(encoded);
                expect(decoded).toBe(sequence);
            });
        });
    });
});
