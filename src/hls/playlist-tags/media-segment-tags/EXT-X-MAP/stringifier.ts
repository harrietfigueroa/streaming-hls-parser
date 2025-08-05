import { EXT_X_MAP_PARSED } from './types';

/**
 * Stringifies EXT-X-MAP tag according to RFC 8216
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
export function extXMapStringifier(val: EXT_X_MAP_PARSED): string {
    const BYTERANGE = val.BYTERANGE;
    const URI = val.URI;

    // Strip quotes from URI if they exist
    const cleanUri = URI.replace(/^"|"$/g, '');
    const attrs = [`URI="${cleanUri}"`];

    if (BYTERANGE) {
        const byteRangeStr = BYTERANGE.OFFSET !== undefined
            ? `${BYTERANGE.LENGTH}@${BYTERANGE.OFFSET}`
            : `${BYTERANGE.LENGTH}`;
        attrs.push(`BYTERANGE="${byteRangeStr}"`);
    }

    return `#EXT-X-MAP:${attrs.join(',')}`;
} 