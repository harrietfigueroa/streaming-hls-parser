import * as z from 'zod';

export const TAG = '#EXT-X-PRELOAD-HINT' as const;

/**
 * The EXT-X-PRELOAD-HINT tag allows clients to issue requests before
 * resources are available, reducing latency in live streams.
 *
 * Its format is:
 *
 * #EXT-X-PRELOAD-HINT:<attribute-list>
 *
 * The following attributes are defined:
 *
 * TYPE: The type of resource being hinted. REQUIRED. Valid values are
 *   PART (for Partial Segments) and MAP (for Media Initialization Sections).
 * URI: The URI of the resource. REQUIRED.
 * BYTERANGE-START: The byte offset of the first byte of the hinted resource.
 * BYTERANGE-LENGTH: The length in bytes of the hinted resource.
 *
 * This tag is used in Media Playlists for low-latency streaming to allow
 * clients to preload resources before they are fully available.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.5.3
 */
export const EXT_X_PRELOAD_HINT_STRING = z.string().startsWith(TAG);

export const EXT_X_PRELOAD_HINT_OBJECT = z
    .object({
        TYPE: z.enum(['PART', 'MAP']),
        URI: z.string(),
        'BYTERANGE-START': z.coerce.number().optional(),
        'BYTERANGE-LENGTH': z.coerce.number().optional(),
    })
    .describe(`
    The EXT-X-PRELOAD-HINT tag allows clients to issue requests before
    resources are available, reducing latency in live streams.

    Its format is:

    #EXT-X-PRELOAD-HINT:<attribute-list>

    The following attributes are defined:

    TYPE: The type of resource being hinted. REQUIRED. Valid values are
      PART (for Partial Segments) and MAP (for Media Initialization Sections).
    URI: The URI of the resource. REQUIRED.
    BYTERANGE-START: The byte offset of the first byte of the hinted resource.
    BYTERANGE-LENGTH: The length in bytes of the hinted resource.

    This tag is used in Media Playlists for low-latency streaming to allow
    clients to preload resources before they are fully available.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.5.3
`);

export const EXT_X_PRELOAD_HINT_CODEC = z.codec(
    EXT_X_PRELOAD_HINT_STRING,
    EXT_X_PRELOAD_HINT_OBJECT,
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
                    if (trimmedKey === 'BYTERANGE-START' || trimmedKey === 'BYTERANGE-LENGTH') {
                        result[trimmedKey] = parseInt(trimmedVal, 10);
                    } else {
                        result[trimmedKey] = trimmedVal;
                    }
                }
            });

            return result;
        },
        encode: (obj) => {
            // TODO: Implement proper attribute list encoding
            const attrs: string[] = [];
            if (obj.TYPE) attrs.push(`TYPE=${obj.TYPE}`);
            if (obj.URI) attrs.push(`URI="${obj.URI}"`);
            if (obj['BYTERANGE-START'] !== undefined) attrs.push(`BYTERANGE-START=${obj['BYTERANGE-START']}`);
            if (obj['BYTERANGE-LENGTH'] !== undefined)
                attrs.push(`BYTERANGE-LENGTH=${obj['BYTERANGE-LENGTH']}`);
            return `${TAG}:${attrs.join(',')}` as any;
        },
    },
);

export type EXT_X_PRELOAD_HINT_STRING_TYPE = `#EXT-X-PRELOAD-HINT:${string}`;
