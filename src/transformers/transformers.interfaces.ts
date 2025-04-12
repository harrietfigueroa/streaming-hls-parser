import { PLAYLIST_TAGS, PLAYLIST_TAGS_TO_STRING_TYPES } from '../hls/hls.types';

export type LexicalToken<PlaylistTag extends PLAYLIST_TAGS = 'URI'> = {
    type: symbol;
    source: PLAYLIST_TAGS_TO_STRING_TYPES[PlaylistTag];
    value: unknown;
};
