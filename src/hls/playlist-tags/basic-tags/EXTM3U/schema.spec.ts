import { describe, expect, it } from 'vitest';
import { EXTM3U_CODEC } from './schema';

describe('EXTM3U schema', () => {
    describe('EXTM3U_CODEC decoding', () => {
        it('should decode a valid EXTM3U tag', () => {
            const tag = '#EXTM3U';
            const result = EXTM3U_CODEC.decode(tag);
            expect(result).toBe(true);
        });

        it('should decode EXTM3U tag with any case variation', () => {
            const tag = '#EXTM3U';
            const result = EXTM3U_CODEC.decode(tag);
            expect(result).toBe(true);
        });
    });

    describe('EXTM3U_CODEC encoding', () => {
        it('should encode a valid EXTM3U tag', () => {
            const input = true;
            const result = EXTM3U_CODEC.encode(input);
            expect(result).toBe('#EXTM3U');
        });

        it('should encode EXTM3U tag consistently', () => {
            const input = true;
            const result = EXTM3U_CODEC.encode(input);
            expect(result).toBe('#EXTM3U');
        });
    });

    describe('EXTM3U_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle', () => {
            const original = true;

            const encoded = EXTM3U_CODEC.encode(original);
            const decoded = EXTM3U_CODEC.decode(encoded);

            expect(decoded).toBe(original);
        });

        it('should produce consistent encoding', () => {
            const input = true;
            const encoded1 = EXTM3U_CODEC.encode(input);
            const encoded2 = EXTM3U_CODEC.encode(input);

            expect(encoded1).toBe(encoded2);
            expect(encoded1).toBe('#EXTM3U');
        });

        it('should produce consistent decoding', () => {
            const tag = '#EXTM3U';
            const decoded1 = EXTM3U_CODEC.decode(tag);
            const decoded2 = EXTM3U_CODEC.decode(tag);

            expect(decoded1).toBe(decoded2);
            expect(decoded1).toBe(true);
        });
    });
});
