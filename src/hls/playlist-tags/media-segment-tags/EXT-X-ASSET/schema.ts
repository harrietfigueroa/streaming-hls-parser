import * as z from 'zod';

export const TAG = '#EXT-X-ASSET' as const;

/**
 * The EXT-X-ASSET tag provides content metadata for ad decision servers
 * in HLS streams. This tag is used by AWS Elemental MediaTailor and other
 * SSAI platforms to pass contextual information about the content to ad
 * servers for improved ad targeting and personalization.
 *
 * Its format is:
 *
 * #EXT-X-ASSET:<attribute-list>
 *
 * The attribute list consists of comma-separated key-value pairs with
 * URL-encoded values. Common attributes include:
 *
 * - GENRE: Content genre code
 * - CAID: Content asset ID
 * - EPISODE: Episode name (URL-encoded)
 * - SEASON: Season identifier
 * - SERIES: Series name
 *
 * Custom metadata keys are also supported. All string values must be
 * URL-encoded (e.g., spaces become %20).
 *
 * Example:
 * #EXT-X-ASSET:GENRE=CV,CAID=12345678,EPISODE="Episode%20Name%20Date"
 *
 * The EXT-X-ASSET tag applies to the content and is used by ad decision
 * servers to select appropriate advertisements based on the content context.
 *
 * Reference: AWS Elemental MediaTailor HLS Ad Markers
 * https://docs.aws.amazon.com/mediatailor/latest/ug/hls-ad-markers.html
 */
export const EXT_X_ASSET_STRING = z.string().startsWith(TAG);

export const EXT_X_ASSET_OBJECT = z
    .record(z.string(), z.string())
    .describe(`
    The EXT-X-ASSET tag provides content metadata for ad decision servers
    in HLS streams. This tag is used by AWS Elemental MediaTailor and other
    SSAI platforms to pass contextual information about the content to ad
    servers for improved ad targeting and personalization.

    Its format is:

    #EXT-X-ASSET:<attribute-list>

    The attribute list consists of comma-separated key-value pairs with
    URL-encoded values. Common attributes include:

    - GENRE: Content genre code
    - CAID: Content asset ID
    - EPISODE: Episode name (URL-encoded)
    - SEASON: Season identifier
    - SERIES: Series name

    Custom metadata keys are also supported. All string values must be
    URL-encoded (e.g., spaces become %20).

    Example:
    #EXT-X-ASSET:GENRE=CV,CAID=12345678,EPISODE="Episode%20Name%20Date"

    The EXT-X-ASSET tag applies to the content and is used by ad decision
    servers to select appropriate advertisements based on the content context.

    Reference: AWS Elemental MediaTailor HLS Ad Markers
    https://docs.aws.amazon.com/mediatailor/latest/ug/hls-ad-markers.html
`);

export const EXT_X_ASSET_CODEC = z.codec(EXT_X_ASSET_STRING, EXT_X_ASSET_OBJECT, {
    decode: (value) => {
        // TODO: Implement proper attribute list parsing
        const attributeListString = value.substring(TAG.length + 1);
        const result: Record<string, string> = {};

        const parts = attributeListString.split(',');
        parts.forEach((part) => {
            const [key, val] = part.split('=');
            if (key && val) {
                const trimmedKey = key.trim();
                // Remove quotes and decode URL encoding
                const trimmedVal = val.replace(/^"|"$/g, '').trim();
                result[trimmedKey] = decodeURIComponent(trimmedVal);
            }
        });

        return result;
    },
    encode: (obj) => {
        // TODO: Implement proper attribute list encoding
        const attrs: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
            // URL-encode the value and wrap in quotes
            const encodedValue = encodeURIComponent(value);
            attrs.push(`${key}="${encodedValue}"`);
        }
        return `${TAG}:${attrs.join(',')}` as any;
    },
});

export type EXT_X_ASSET_STRING_TYPE = `#EXT-X-ASSET:${string}`;
