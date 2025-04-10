import { PLAYLIST_TAGS, PLAYLIST_TAGS_TO_TYPES } from '../hls/hls.types';

export type Lexical<PlaylistTag extends PLAYLIST_TAGS = 'URI'> = {
    type: symbol;
    source: PLAYLIST_TAGS_TO_TYPES[PlaylistTag];
};

// export interface MediaPlaylistLine extends Lexical<keyof HLS_TAG_TYPES_TO_SOURCE_VALUE> {
//     value: unknown;
// }
