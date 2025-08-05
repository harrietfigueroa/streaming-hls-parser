import { describe, expect, it } from 'vitest';
import playlistTypeTag, { PlaylistTypes } from './segment-tag';

describe('EXT-X-PLAYLIST-TYPE generic stringifier', () => {
    it('should have correct generic type inference for EVENT', () => {
        const value = PlaylistTypes.EVENT;
        const stringified = playlistTypeTag.stringifier(value);

        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:EVENT');
        expect(typeof stringified).toBe('string');
    });

    it('should have correct generic type inference for VOD', () => {
        const value = PlaylistTypes.VOD;
        const stringified = playlistTypeTag.stringifier(value);

        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:VOD');
        expect(typeof stringified).toBe('string');
    });

    it('should work with literal types', () => {
        const value = 'EVENT' as const;
        const stringified = playlistTypeTag.stringifier(value);

        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:EVENT');
    });
}); 