import { playlistTagRegistry } from '../hls/playlist-tags/playlist-tag.registry';

// Extract playlist tag types from the registry
export type PlaylistTag = keyof typeof playlistTagRegistry;

// Create a mapping from playlist tags to their string types using the registry
export type PlaylistTagsToStringTypes = {
    [K in PlaylistTag]: K extends keyof typeof playlistTagRegistry
        ? (typeof playlistTagRegistry)[K] extends { _input: infer Input }
            ? Input
            : string
        : string;
} & {
    URI: string; // URI always maps to a string
    '#EXTINF': string; // EXTINF is handled separately
};

// Union type of all possible playlist tags including URI and EXTINF
export type AllPlaylistTags = PlaylistTag | 'URI' | '#EXTINF';

export type LexicalToken<Tag extends AllPlaylistTags = AllPlaylistTags> = {
    type: Tag;
    source: string; // Keep as string since we don't know the exact format at tokenization time
    value: unknown;
};

export type Reviver = (context: LexicalToken) => LexicalToken;
