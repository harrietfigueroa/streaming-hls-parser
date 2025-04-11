import { EXT_X_PLAYLIST_TYPE_PARSED, EXT_X_PLAYLIST_TYPE_STRING } from './types';

export default function (val: EXT_X_PLAYLIST_TYPE_PARSED) {
    return `#EXT-X-PLAYLIST-TYPE:${val}` as const satisfies EXT_X_PLAYLIST_TYPE_STRING;
}
