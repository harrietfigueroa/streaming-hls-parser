import { describe, expect, it, vi } from 'vitest';
import { EXT_X_MAP_CODEC } from './schema';

describe('EXT-X-MAP schema', () => {
    describe('EXT-X-MAP_CODEC decoding', () => {
        it('should decode a valid EXT-X-MAP tag', () => {
            const tag = '#EXT-X-MAP:URI="https://example.com/map.mp4",BYTERANGE="1024@2048"';
            const result = EXT_X_MAP_CODEC.decode(tag);
            expect(result).toMatchObject({
                URI: 'https://example.com/map.mp4',
                BYTERANGE: { n: 1024, o: 2048 },
            });
        });

        it('should decode a valid EXT-X-MAP with only BYTERANGE n', () => {
            const tag = '#EXT-X-MAP:URI="https://example.com/map.mp4",BYTERANGE="1024"';
            const result = EXT_X_MAP_CODEC.decode(tag);
            expect(result).toMatchObject({
                URI: 'https://example.com/map.mp4',
                BYTERANGE: { n: 1024 },
            });
        });
    });
    describe('EXT-X-MAP_CODEC encoding', () => {
        it('should encode a valid EXT-X-MAP tag', () => {
            const input = {
                URI: 'https://example.com/map.mp4',
                BYTERANGE: { n: 1024, o: 2048 },
            };
            const result = EXT_X_MAP_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-MAP:URI="https://example.com/map.mp4",BYTERANGE="1024@2048"',
            );
        });
    });
});
