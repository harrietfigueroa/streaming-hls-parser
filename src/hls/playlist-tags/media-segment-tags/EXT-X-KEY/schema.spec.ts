import { describe, it, expect } from 'vitest';
import { EXT_X_KEY_CODEC } from './schema';

describe('EXT_X_KEY_CODEC', () => {
    describe('EXT_X_KEY_CODEC decoding', () => {
        it('should decode a valid EXT_X_KEY tag', () => {
            const tag =
                '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key.key",IV="00000000000000000000000000000000"';
            const result = EXT_X_KEY_CODEC.safeDecode(tag);
            expect(result.success).toBe(true);
        });
    });

    describe('EXT_X_KEY_CODEC encoding', () => {
        it('should encode a valid EXT_X_KEY tag', () => {
            const input = {
                METHOD: 'AES-128',
                URI: 'https://example.com/key.key',
                IV: '00000000000000000000000000000000',
            } as const;
            const result = EXT_X_KEY_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-KEY:METHOD=AES-128,URI="https://example.com/key.key",IV=00000000000000000000000000000000',
            );
        });
    });
});
