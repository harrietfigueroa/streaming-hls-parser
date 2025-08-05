import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_KEY_PARSED, EXT_X_KEY_METHOD_VALUES } from './types';

/**
 * Parses EXT-X-KEY tag according to RFC 8216
 * 
 * RFC 8216 Section 4.3.2.4:
 * #EXT-X-KEY:METHOD=<method>[,URI="<uri>"][,IV=<iv>][,KEYFORMAT="<keyformat>"][,KEYFORMATVERSIONS="<keyformatversions>"]
 */
export function extXKeyParser<T extends string>(str: T): EXT_X_KEY_PARSED | undefined {
    if (!str?.startsWith('#EXT-X-KEY:')) {
        return undefined;
    }

    try {
        const attributes: string = str.slice('#EXT-X-KEY:'.length);

        // Parse METHOD first (required)
        let method: EXT_X_KEY_METHOD_VALUES | undefined;
        const methodMatch = attributes.match(/METHOD=([^,]+)/);
        if (methodMatch) {
            method = methodMatch[1] as EXT_X_KEY_METHOD_VALUES;
        }

        // Parse URI
        let uri: string | undefined;
        const uriMatch = attributes.match(/URI="([^"]*)"/);
        if (uriMatch) {
            uri = uriMatch[1];
        }

        // Parse IV
        let iv: string | undefined;
        const ivMatch = attributes.match(/IV=([^,]+)/);
        if (ivMatch) {
            iv = ivMatch[1];
        }

        // Parse KEYFORMAT
        let keyformat: string | undefined;
        const keyformatMatch = attributes.match(/KEYFORMAT="([^"]*)"/);
        if (keyformatMatch) {
            keyformat = keyformatMatch[1];
        }

        // Parse KEYFORMATVERSIONS
        let keyformatversions: string | undefined;
        const keyformatversionsMatch = attributes.match(/KEYFORMATVERSIONS="([^"]*)"/);
        if (keyformatversionsMatch) {
            keyformatversions = keyformatversionsMatch[1];
        }

        // Validate that we have at least a METHOD
        if (!method) {
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
            if (attributeName !== 'METHOD' && attributeName !== 'URI' && attributeName !== 'IV' && attributeName !== 'KEYFORMAT' && attributeName !== 'KEYFORMATVERSIONS') {
                // Found an invalid attribute
                return undefined;
            }
        }

        return {
            METHOD: method,
            URI: uri,
            IV: iv,
            KEYFORMAT: keyformat,
            KEYFORMATVERSIONS: keyformatversions,
        };
    } catch {
        return undefined;
    }
} 