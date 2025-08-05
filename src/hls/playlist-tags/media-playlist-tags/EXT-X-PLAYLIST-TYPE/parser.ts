import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { PlaylistTypes, PlaylistTypeValues } from './types';

// Helper type to check if a string represents a valid playlist type
type IsValidPlaylistType<T extends string> =
    T extends 'EVENT' | 'VOD'
    ? true
    : false;

// Helper type to convert string to playlist type if valid
type StringToPlaylistType<T extends string> =
    IsValidPlaylistType<T> extends true
    ? T extends 'EVENT'
    ? 'EVENT'
    : T extends 'VOD'
    ? 'VOD'
    : never
    : never;

// Main parser type that returns the appropriate type based on input
type ExtXPlaylistTypeParser<T extends string> =
    T extends `#EXT-X-PLAYLIST-TYPE:${infer Value}`
    ? IsValidPlaylistType<Value> extends true
    ? StringToPlaylistType<Value>
    : undefined
    : PlaylistTypeValues | undefined;

export function extXPlaylistTypeParser<T extends string>(str: T): ExtXPlaylistTypeParser<T> {
    const eventType = colonSeparated(str);

    if (eventType === PlaylistTypes.EVENT) {
        return PlaylistTypes.EVENT as ExtXPlaylistTypeParser<T>;
    }

    if (eventType === PlaylistTypes.VOD) {
        return PlaylistTypes.VOD as ExtXPlaylistTypeParser<T>;
    }

    return undefined as ExtXPlaylistTypeParser<T>;
} 