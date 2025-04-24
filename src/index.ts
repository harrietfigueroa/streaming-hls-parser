import { MediaPlaylist } from './hls/playlists/media-playlist';
import { MultivariantPlaylist } from './hls/playlists/multivariant-playlist';

export class HLS {
    public static parseMediaPlaylist(input: string): MediaPlaylist;
    public static parseMediaPlaylist(input: AsyncIterable<string>): Promise<MediaPlaylist>;
    public static parseMediaPlaylist(
        input: string | AsyncIterable<string>,
    ): MediaPlaylist | Promise<MediaPlaylist> {
        if (typeof input === 'string') {
            return MediaPlaylist.fromStream(input);
        }
        return MediaPlaylist.fromStream(input);
    }

    public static parseMultivariantPlaylist(input: string): MultivariantPlaylist;
    public static parseMultivariantPlaylist(
        input: AsyncIterable<string>,
    ): Promise<MultivariantPlaylist>;
    public static parseMultivariantPlaylist(
        input: string | AsyncIterable<string>,
    ): MultivariantPlaylist | Promise<MultivariantPlaylist> {
        if (typeof input === 'string') {
            return MultivariantPlaylist.fromStream(input);
        }
        return MultivariantPlaylist.fromStream(input);
    }

    public static stringify(playlist: MediaPlaylist | MultivariantPlaylist): string {
        if (playlist instanceof MediaPlaylist) {
            return playlist.toString();
        }
        if (playlist instanceof MultivariantPlaylist) {
            return playlist.toString();
        }

        throw new Error(`Invalid playlist type: ${playlist}`);
    }
}
