import * as z from 'zod';

export const TAG = '#EXT-X-CONTENT-STEERING' as const;

/**
 * The EXT-X-CONTENT-STEERING tag implements content steering functionality
 * in Multivariant Playlists, allowing the server to direct clients to
 * preferred content delivery paths.
 *
 * Its format is:
 *
 * #EXT-X-CONTENT-STEERING:<attribute-list>
 *
 * The following attributes are defined:
 *
 * SERVER-URI: The URI of the content steering server. REQUIRED.
 * PATHWAY-ID: The pathway ID that the client should use initially.
 *
 * Content steering allows servers to dynamically direct clients to specific
 * CDN pathways or content sources based on network conditions, geography,
 * or other factors without requiring playlist updates.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.6.6
 */
export const EXT_X_CONTENT_STEERING_STRING = z.string().startsWith(TAG);

export const EXT_X_CONTENT_STEERING_OBJECT = z
    .object({
        'SERVER-URI': z.string(),
        'PATHWAY-ID': z.string().optional(),
    })
    .describe(`
    The EXT-X-CONTENT-STEERING tag implements content steering functionality
    in Multivariant Playlists, allowing the server to direct clients to
    preferred content delivery paths.

    Its format is:

    #EXT-X-CONTENT-STEERING:<attribute-list>

    The following attributes are defined:

    SERVER-URI: The URI of the content steering server. REQUIRED.
    PATHWAY-ID: The pathway ID that the client should use initially.

    Content steering allows servers to dynamically direct clients to specific
    CDN pathways or content sources based on network conditions, geography,
    or other factors without requiring playlist updates.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.6.6
`);

export const EXT_X_CONTENT_STEERING_CODEC = z.codec(
    EXT_X_CONTENT_STEERING_STRING,
    EXT_X_CONTENT_STEERING_OBJECT,
    {
        decode: (value) => {
            // TODO: Implement proper attribute list parsing
            const attributeListString = value.substring(TAG.length + 1);
            const result: any = {};

            const parts = attributeListString.split(',');
            parts.forEach((part) => {
                const [key, val] = part.split('=');
                if (key && val) {
                    const trimmedKey = key.trim();
                    const trimmedVal = val.replace(/^"|"$/g, '').trim();
                    result[trimmedKey] = trimmedVal;
                }
            });

            return result;
        },
        encode: (obj) => {
            // TODO: Implement proper attribute list encoding
            const attrs: string[] = [];
            if (obj['SERVER-URI']) attrs.push(`SERVER-URI="${obj['SERVER-URI']}"`);
            if (obj['PATHWAY-ID']) attrs.push(`PATHWAY-ID="${obj['PATHWAY-ID']}"`);
            return `${TAG}:${attrs.join(',')}` as any;
        },
    },
);

export type EXT_X_CONTENT_STEERING_STRING_TYPE = `#EXT-X-CONTENT-STEERING:${string}`;
