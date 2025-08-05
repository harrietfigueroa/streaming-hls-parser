import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXPlaylistTypeStringifier } from './stringifier';
import { EXT_X_PLAYLIST_TYPE_STRING, PlaylistTypeValues } from './types';

describe('EXT-X-PLAYLIST-TYPE stringifier', () => {
    it('should stringify EVENT with template literal using passed value', () => {
        const value = 'EVENT';
        const stringified = extXPlaylistTypeStringifier(value);

        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:EVENT');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_PLAYLIST_TYPE_STRING<typeof value>>();
    });

    it('should stringify VOD with template literal using passed value', () => {
        const value = 'VOD';
        const stringified = extXPlaylistTypeStringifier(value);

        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:VOD');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_PLAYLIST_TYPE_STRING<typeof value>>();
    });

    it('should use the actual passed value', () => {
        const value = 'EVENT';
        const stringified = extXPlaylistTypeStringifier(value);

        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:EVENT');
        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_PLAYLIST_TYPE_STRING<typeof value>>();
    });

    it('should have correct generic type inference', () => {
        const value = 'VOD' as const;
        const stringified = extXPlaylistTypeStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).toMatchTypeOf<EXT_X_PLAYLIST_TYPE_STRING<typeof value>>();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 