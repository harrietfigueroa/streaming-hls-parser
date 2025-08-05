import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_MAP_PARSED } from './types';

/**
 * Parses EXT-X-MAP tag according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.5:
 * #EXT-X-MAP:<attribute-list>
 * 
 * where attribute-list contains one or more of the following
 * attribute/value pairs:
 * 
 * URI=<uri>
 * BYTERANGE=<n>[@<o>]
 * 
 * where uri is a quoted-string; n and o are decimal-integers.
 */
export function extXMapParser<T extends string>(str: T): EXT_X_MAP_PARSED | undefined {
    if (!str?.startsWith('#EXT-X-MAP:')) {
        return undefined;
    }

    try {
        const attributes: string = str.slice('#EXT-X-MAP:'.length);

        // Parse URI first
        let uri: string | undefined;
        const uriMatch = attributes.match(/URI="([^"]*)"/);
        if (uriMatch) {
            uri = uriMatch[1];
        }

        // Parse BYTERANGE
        let byteRange: { LENGTH: number; OFFSET?: number } | undefined;
        const byteRangeMatch = attributes.match(/BYTERANGE="([^"]*)"/);
        if (byteRangeMatch) {
            const byteRangeStr = byteRangeMatch[1];
            const parts = byteRangeStr.split('@');
            const LENGTH = parseInt(parts[0], 10);
            const OFFSET = parts.length > 1 ? parseInt(parts[1], 10) : undefined;

            if (!isNaN(LENGTH)) {
                byteRange = { LENGTH, OFFSET };
            } else {
                // Invalid BYTERANGE format
                return undefined;
            }
        }

        // Validate that we have at least a URI
        if (!uri) {
            return undefined;
        }

        // Check for any invalid attributes by parsing all attribute pairs
        const attributePairs = attributes.split(',');
        for (const pair of attributePairs) {
            const trimmedPair = pair.trim();
            if (!trimmedPair) continue;

            const equalIndex = trimmedPair.indexOf('=');
            if (equalIndex === -1) {
                // No equals sign found
                return undefined;
            }

            const attributeName = trimmedPair.substring(0, equalIndex);
            if (attributeName !== 'URI' && attributeName !== 'BYTERANGE') {
                // Found an invalid attribute
                return undefined;
            }
        }

        return {
            URI: uri,
            BYTERANGE: byteRange,
        };
    } catch {
        return undefined;
    }
} 