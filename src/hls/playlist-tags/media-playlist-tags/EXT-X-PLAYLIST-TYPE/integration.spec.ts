import { describe, expect, it } from 'vitest';
import playlistTypeTag, { PlaylistTypes } from './segment-tag';

describe('EXT-X-PLAYLIST-TYPE integration', () => {
    it('should parse and stringify EVENT round-trip', () => {
        const original = '#EXT-X-PLAYLIST-TYPE:EVENT';
        const parsed = playlistTypeTag.parser(original);
        const stringified = playlistTypeTag.stringifier(parsed!);

        expect(parsed).toBe('EVENT');
        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:EVENT');
    });

    it('should parse and stringify VOD round-trip', () => {
        const original = '#EXT-X-PLAYLIST-TYPE:VOD';
        const parsed = playlistTypeTag.parser(original);
        const stringified = playlistTypeTag.stringifier(parsed!);

        expect(parsed).toBe('VOD');
        expect(stringified).toBe('#EXT-X-PLAYLIST-TYPE:VOD');
    });

    it('should handle PlaylistTypes constant round-trip', () => {
        const original = `#EXT-X-PLAYLIST-TYPE:${PlaylistTypes.EVENT}`;
        const parsed = playlistTypeTag.parser(original);
        const stringified = playlistTypeTag.stringifier(parsed!);

        expect(parsed).toBe(PlaylistTypes.EVENT);
        expect(stringified).toBe(`#EXT-X-PLAYLIST-TYPE:${PlaylistTypes.EVENT}`);
    });

    it('should maintain type safety through round-trip', () => {
        const original = '#EXT-X-PLAYLIST-TYPE:VOD';
        const parsed = playlistTypeTag.parser(original);
        const stringified = playlistTypeTag.stringifier(parsed!);

        // TypeScript should infer the exact types
        expect(typeof parsed).toBe('string');
        expect(typeof stringified).toBe('string');
        expect(stringified).toMatch(/^#EXT-X-PLAYLIST-TYPE:(EVENT|VOD)$/);
    });

    it('should handle null parsing gracefully', () => {
        const original = '#EXT-X-PLAYLIST-TYPE:INVALID';
        const parsed = playlistTypeTag.parser(original);

        expect(parsed).toBeNull();
        // Cannot stringify null, so we don't test that
    });
}); 