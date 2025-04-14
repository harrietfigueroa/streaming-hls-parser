import {
    BASIC_TAGS,
    MEDIA_OR_MULTIVARIANT_TAGS,
    MEDIA_PLAYLIST_TAGS,
    MEDIA_SEGMENT_TAGS,
    MULTIVARIANT_PLAYLIST_TAGS,
    PLAYLIST_TAGS,
} from './hls.types';

/**
 * A wrapper for matching HLS tags to their global symbol registry entry. Any tag not already
 * registered will be added to the registry to allow for custom tags.
 * @param tag An HLS tag to be retrieved from the global symbol registry
 * @returns
 */
export default function <T extends PLAYLIST_TAGS>(tag: T): symbol {
    if (typeof tag !== 'string') {
        throw new TypeError(`HLSTag expected a string, but received ${typeof tag}`);
    }
    // Some tags will have a colon and attributes (much like people do in the real world)
    const trimmed = tag.trim();
    const firstColon = trimmed.indexOf(':');
    if (firstColon && trimmed.slice(firstColon + 1)) {
        const stripped = trimmed.split(':')[0];
        return Symbol.for(stripped);
    }
    return Symbol.for(tag);
}
