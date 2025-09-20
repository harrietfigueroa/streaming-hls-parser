import { describe, expect, it } from 'vitest';
import { EXT_X_I_FRAMES_ONLY_CODEC } from './schema';

describe('EXT-X-I-FRAMES-ONLY schema', () => {
    describe('EXT_X_I_FRAMES_ONLY_CODEC decoding', () => {
        it('should decode a valid EXT-X-I-FRAMES-ONLY tag', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY';
            const result = EXT_X_I_FRAMES_ONLY_CODEC.decode(tag);
            expect(result).toBe(true);
        });

        it('should decode EXT-X-I-FRAMES-ONLY tag consistently', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY';
            const result = EXT_X_I_FRAMES_ONLY_CODEC.decode(tag);
            expect(result).toBe(true);
        });
    });

    describe('EXT_X_I_FRAMES_ONLY_CODEC encoding', () => {
        it('should encode a valid EXT-X-I-FRAMES-ONLY tag', () => {
            const input = true;
            const result = EXT_X_I_FRAMES_ONLY_CODEC.encode(input);
            expect(result).toBe('#EXT-X-I-FRAMES-ONLY');
        });

        it('should encode EXT-X-I-FRAMES-ONLY tag consistently', () => {
            const input = true;
            const result = EXT_X_I_FRAMES_ONLY_CODEC.encode(input);
            expect(result).toBe('#EXT-X-I-FRAMES-ONLY');
        });
    });

    describe('EXT_X_I_FRAMES_ONLY_CODEC validation', () => {
        it('should reject EXT-X-I-FRAMES-ONLY with extra characters', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY:';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject EXT-X-I-FRAMES-ONLY with parameters', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY:YES';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject EXT-X-I-FRAMES-ONLY with spaces', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY ';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject EXT-X-I-FRAMES-ONLY with trailing content', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY\n#EXT-X-VERSION:3';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject wrong tag name', () => {
            const tag = '#EXT-X-I-FRAMES';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject wrong tag name with extra characters', () => {
            const tag = '#EXT-X-I-FRAMES-ONLYY';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject missing hash', () => {
            const tag = 'EXT-X-I-FRAMES-ONLY';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject lowercase tag', () => {
            const tag = '#ext-x-i-frames-only';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should reject mixed case tag', () => {
            const tag = '#EXT-X-I-Frames-Only';
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).toThrow();
        });

        it('should accept exact EXT-X-I-FRAMES-ONLY tag', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY';
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.decode(tag)).not.toThrow();
            const result = EXT_X_I_FRAMES_ONLY_CODEC.decode(tag);
            expect(result).toBe(true);
        });

        it('should reject encoding false value', () => {
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.encode(false)).toThrow();
        });

        it('should reject encoding non-boolean values', () => {
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.encode(1)).toThrow();
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.encode('true')).toThrow();
            // @ts-expect-error
            expect(() => EXT_X_I_FRAMES_ONLY_CODEC.encode({})).toThrow();
        });
    });

    describe('EXT_X_I_FRAMES_ONLY_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle', () => {
            const original = true;

            const encoded = EXT_X_I_FRAMES_ONLY_CODEC.encode(original);
            const decoded = EXT_X_I_FRAMES_ONLY_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should produce consistent encoding', () => {
            const input = true;
            const encoded1 = EXT_X_I_FRAMES_ONLY_CODEC.encode(input);
            const encoded2 = EXT_X_I_FRAMES_ONLY_CODEC.encode(input);

            expect(encoded1).toBe(encoded2);
            expect(encoded1).toBe('#EXT-X-I-FRAMES-ONLY');
        });

        it('should produce consistent decoding', () => {
            const tag = '#EXT-X-I-FRAMES-ONLY';
            const decoded1 = EXT_X_I_FRAMES_ONLY_CODEC.decode(tag);
            const decoded2 = EXT_X_I_FRAMES_ONLY_CODEC.decode(tag);

            expect(decoded1).toBe(decoded2);
            expect(decoded1).toBe(true);
        });
    });
});
