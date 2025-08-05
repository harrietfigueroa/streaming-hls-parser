import { EXT_X_PLAYLIST_TYPE_STRING, PlaylistTypeValues } from './types';

export function extXPlaylistTypeStringifier<playlistType extends PlaylistTypeValues>(val: playlistType): EXT_X_PLAYLIST_TYPE_STRING<playlistType> {
    return `#EXT-X-PLAYLIST-TYPE:${val}` as const;
} 