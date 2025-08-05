import { EXT_X_KEY_PARSED } from './types';

/**
 * Stringifies EXT-X-KEY tag according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.4:
 * #EXT-X-KEY:METHOD=<method>[,URI="<uri>"][,IV=<iv>][,KEYFORMAT="<keyformat>"][,KEYFORMATVERSIONS="<keyformatversions>"]
 */
export function extXKeyStringifier(val: EXT_X_KEY_PARSED): string {
    const METHOD = val.METHOD;
    const URI = val.URI;
    const IV = val.IV;
    const KEYFORMAT = val.KEYFORMAT;
    const KEYFORMATVERSIONS = val.KEYFORMATVERSIONS;

    const attrs = [`METHOD=${METHOD}`];
    if (URI) {
        // Strip existing quotes if present
        const cleanUri = URI.replace(/^"|"$/g, '');
        attrs.push(`URI="${cleanUri}"`);
    }
    if (IV) {
        attrs.push(`IV=${IV}`);
    }
    if (KEYFORMAT) {
        // Strip existing quotes if present
        const cleanKeyformat = KEYFORMAT.replace(/^"|"$/g, '');
        attrs.push(`KEYFORMAT="${cleanKeyformat}"`);
    }
    if (KEYFORMATVERSIONS) {
        // Strip existing quotes if present
        const cleanKeyformatversions = KEYFORMATVERSIONS.replace(/^"|"$/g, '');
        attrs.push(`KEYFORMATVERSIONS="${cleanKeyformatversions}"`);
    }

    return `#EXT-X-KEY:${attrs.join(',')}`;
} 