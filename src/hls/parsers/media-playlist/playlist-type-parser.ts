import { PlaylistType } from '../../media-playlist/media-playlist';

export function playlistTypeParse(str: string): PlaylistType | null {
    switch (str) {
        case PlaylistType.EVENT:
            return PlaylistType.EVENT;
        case PlaylistType.VOD:
            return PlaylistType.VOD;
        default:
            return null;
    }
}
