import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXPlaylistTypeParser } from './parser';
import { PlaylistTypes, PlaylistTypeValues } from './types';

describe('EXT-X-PLAYLIST-TYPE parser', () => {
    it('should parse EVENT type', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:EVENT';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBe('EVENT');
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should parse VOD type', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:VOD';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBe('VOD');
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should return undefined for invalid type', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:INVALID';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBeUndefined();
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should return undefined for empty string', () => {
        const test = '';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBeUndefined();
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should return undefined for lowercase event', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:event';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBeUndefined();
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should return undefined for lowercase vod', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:vod';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBeUndefined();
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should return undefined for mixed case', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:Event';
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBeUndefined();
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should parse with PlaylistTypes constant', () => {
        const test = `#EXT-X-PLAYLIST-TYPE:${PlaylistTypes.EVENT}`;
        const parsed = extXPlaylistTypeParser(test);

        expect(parsed).toBe(PlaylistTypes.EVENT);
        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-PLAYLIST-TYPE:EVENT';
        const parsed = extXPlaylistTypeParser(test);

        expectTypeOf(parsed).toMatchTypeOf<PlaylistTypeValues | undefined>();
        expectTypeOf(parsed).not.toBeNumber();
        expectTypeOf(parsed).not.toBeBoolean();
    });
}); 