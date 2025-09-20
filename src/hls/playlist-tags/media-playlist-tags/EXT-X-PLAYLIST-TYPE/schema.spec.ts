import { describe, expect, it } from 'vitest';
import { EXT_X_PLAYLIST_TYPE_CODEC } from './schema';

describe('EXT-X-PLAYLIST-TYPE schema', () => {
    describe('EXT_X_PLAYLIST_TYPE_CODEC decoding', () => {
        it('should parse valid attribute list', () => {
            const input = '#EXT-X-PLAYLIST-TYPE:EVENT';
            const result = EXT_X_PLAYLIST_TYPE_CODEC.decode(input);
            expect(result).toBe('EVENT');
        });
        it('should reject invalid value', () => {
            const input = '#EXT-X-PLAYLIST-TYPE:INVALID';

            // @ts-expect-error invalid value
            expect(() => EXT_X_PLAYLIST_TYPE_CODEC.decode(input)).toThrow();
        });
    });
    describe('EXT_X_PLAYLIST_TYPE_CODEC encoding', () => {
        it('should encode valid attribute list', () => {
            const input = 'EVENT';
            const result = EXT_X_PLAYLIST_TYPE_CODEC.encode(input);
            expect(result).toBe('#EXT-X-PLAYLIST-TYPE:EVENT');
        });
    });
});
