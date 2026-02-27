import { AllPlaylistTags } from '../parser/parser.interfaces';

/**
 * A wrapper for matching HLS tags to their global symbol registry entry. Any tag not already
 * registered will be added to the registry to allow for custom tags.
 * @param tag An HLS tag to be retrieved from the global symbol registry
 * @returns
 */
export function parseHLSTag<T extends AllPlaylistTags>(tag: T): AllPlaylistTags {
    if (typeof tag !== 'string') {
        throw new TypeError(`HLSTag expected a string, but received ${typeof tag}`);
    }
    // Some tags will have a colon and attributes (much like people do in the real world)
    const firstColon = tag.indexOf(':');
    if (firstColon && tag.slice(firstColon + 1)) {
        const stripped = tag.split(':')[0];
        return stripped as AllPlaylistTags;
    }
    return tag;
}
