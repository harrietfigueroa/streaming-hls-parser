import { PLAYLIST_TAGS, PLAYLIST_TAGS_TO_STRING_TYPES } from '../hls/hls.types';

export type LexicalToken<PlaylistTag extends PLAYLIST_TAGS = 'URI'> = {
    type: symbol;
    source: PLAYLIST_TAGS_TO_STRING_TYPES[PlaylistTag];
};

export interface MediaSegmentToken<PlaylistTag extends PLAYLIST_TAGS = 'URI'>
    extends LexicalToken<PlaylistTag> {
    value: unknown;
}

export interface PlaylistToken<PlaylistTag extends PLAYLIST_TAGS = 'URI'>
    extends LexicalToken<PlaylistTag> {
    value: unknown;
}
