import { describe, expect, it } from 'vitest';
import { EXT_X_ENDLIST_CODEC } from './schema';

describe('EXT-X-ENDLIST schema', () => {
    describe('EXT_X_ENDLIST_CODEC decoding', () => {
        it('should decode a valid EXT-X-ENDLIST tag', () => {
            const tag = '#EXT-X-ENDLIST';
            const result = EXT_X_ENDLIST_CODEC.decode(tag);
            expect(result).toBe(true);
        });

        it('should decode EXT-X-ENDLIST tag consistently', () => {
            const tag = '#EXT-X-ENDLIST';
            const result = EXT_X_ENDLIST_CODEC.decode(tag);
            expect(result).toBe(true);
        });
    });

    describe('EXT_X_ENDLIST_CODEC encoding', () => {
        it('should encode a valid EXT-X-ENDLIST tag', () => {
            const input = true;
            const result = EXT_X_ENDLIST_CODEC.encode(input);
            expect(result).toBe('#EXT-X-ENDLIST');
        });

        it('should encode EXT-X-ENDLIST tag consistently', () => {
            const input = true;
            const result = EXT_X_ENDLIST_CODEC.encode(input);
            expect(result).toBe('#EXT-X-ENDLIST');
        });
    });

    describe('EXT_X_ENDLIST_CODEC validation', () => {
        it('should reject EXT-X-ENDLIST with extra characters', () => {
            const tag = '#EXT-X-ENDLIST:';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject EXT-X-ENDLIST with parameters', () => {
            const tag = '#EXT-X-ENDLIST:YES';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject EXT-X-ENDLIST with spaces', () => {
            const tag = '#EXT-X-ENDLIST ';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject EXT-X-ENDLIST with trailing content', () => {
            const tag = '#EXT-X-ENDLIST\n#EXT-X-VERSION:3';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject wrong tag name', () => {
            const tag = '#EXT-X-END';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject wrong tag name with extra characters', () => {
            const tag = '#EXT-X-ENDLISTT';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject missing hash', () => {
            const tag = 'EXT-X-ENDLIST';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject lowercase tag', () => {
            const tag = '#ext-x-endlist';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should reject mixed case tag', () => {
            const tag = '#EXT-X-EndList';
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).toThrow();
        });

        it('should accept exact EXT-X-ENDLIST tag', () => {
            const tag = '#EXT-X-ENDLIST';
            expect(() => EXT_X_ENDLIST_CODEC.decode(tag)).not.toThrow();
            const result = EXT_X_ENDLIST_CODEC.decode(tag);
            expect(result).toBe(true);
        });

        it('should reject encoding false value', () => {
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.encode(false)).toThrow();
        });

        it('should reject encoding non-boolean values', () => {
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.encode(1)).toThrow();
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.encode('true')).toThrow();
            // @ts-expect-error
            expect(() => EXT_X_ENDLIST_CODEC.encode({})).toThrow();
        });
    });

    describe('EXT_X_ENDLIST_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle', () => {
            const original = true;

            const encoded = EXT_X_ENDLIST_CODEC.encode(original);
            const decoded = EXT_X_ENDLIST_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should produce consistent encoding', () => {
            const input = true;
            const encoded1 = EXT_X_ENDLIST_CODEC.encode(input);
            const encoded2 = EXT_X_ENDLIST_CODEC.encode(input);

            expect(encoded1).toBe(encoded2);
            expect(encoded1).toBe('#EXT-X-ENDLIST');
        });

        it('should produce consistent decoding', () => {
            const tag = '#EXT-X-ENDLIST';
            const decoded1 = EXT_X_ENDLIST_CODEC.decode(tag);
            const decoded2 = EXT_X_ENDLIST_CODEC.decode(tag);

            expect(decoded1).toBe(decoded2);
            expect(decoded1).toBe(true);
        });
    });
});
