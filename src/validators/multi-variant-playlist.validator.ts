import { MultivariantPlaylist } from '../hls/playlists/multivariant-playlist';

export class MultivariantPlaylistValidator {
    // Validate that all URIs are Media Playlists
    // Validate EXT-X-MEDIA tag
    //  * Type MUST be defined
    //  * If TYPE is CLOSED-CAPTIONS then URI MUST NOT be present
    //  * GROUP-ID is REQUIRED
    public static validate(multivariantPlaylist: MultivariantPlaylist) {}
}
