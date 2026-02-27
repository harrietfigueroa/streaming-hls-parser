import * as z from 'zod';

export const TAG = '#EXT-X-PART' as const;

/**
 * The EXT-X-PART tag identifies Partial Segments, which are used for
 * Low-Latency HLS (LL-HLS) streaming. Partial Segments allow playback
 * to begin before complete segments are available.
 *
 * Its format is:
 *
 * #EXT-X-PART:<attribute-list>
 *
 * The following attributes are defined:
 *
 * URI: The URI of the Partial Segment. REQUIRED.
 * DURATION: The duration of the Partial Segment as a decimal-floating-point
 *   number of seconds. REQUIRED.
 * INDEPENDENT: An enumerated-string (YES or NO) indicating whether the
 *   Partial Segment contains an independent frame.
 * BYTERANGE: A byte range into the resource identified by the URI.
 * GAP: An enumerated-string (YES or NO) indicating whether the Partial
 *   Segment is not available and should not be loaded.
 *
 * This tag applies to Media Segments and is used for low-latency streaming.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.4.9
 */
export const EXT_X_PART_STRING = z.string().startsWith(TAG);

export const EXT_X_PART_OBJECT = z
    .object({
        URI: z.string(),
        DURATION: z.coerce.number(),
        INDEPENDENT: z.enum(['YES', 'NO']).optional(),
        BYTERANGE: z.string().optional(),
        GAP: z.enum(['YES', 'NO']).optional(),
    })
    .describe(`
    The EXT-X-PART tag identifies Partial Segments, which are used for
    Low-Latency HLS (LL-HLS) streaming. Partial Segments allow playback
    to begin before complete segments are available.

    Its format is:

    #EXT-X-PART:<attribute-list>

    The following attributes are defined:

    URI: The URI of the Partial Segment. REQUIRED.
    DURATION: The duration of the Partial Segment as a decimal-floating-point
      number of seconds. REQUIRED.
    INDEPENDENT: An enumerated-string (YES or NO) indicating whether the
      Partial Segment contains an independent frame.
    BYTERANGE: A byte range into the resource identified by the URI.
    GAP: An enumerated-string (YES or NO) indicating whether the Partial
      Segment is not available and should not be loaded.

    This tag applies to Media Segments and is used for low-latency streaming.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.4.9
`);

export const EXT_X_PART_CODEC = z.codec(EXT_X_PART_STRING, EXT_X_PART_OBJECT, {
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
                if (trimmedKey === 'DURATION') {
                    result[trimmedKey] = parseFloat(trimmedVal);
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
        if (obj.URI) attrs.push(`URI="${obj.URI}"`);
        if (obj.DURATION !== undefined) attrs.push(`DURATION=${obj.DURATION}`);
        if (obj.INDEPENDENT) attrs.push(`INDEPENDENT=${obj.INDEPENDENT}`);
        if (obj.BYTERANGE) attrs.push(`BYTERANGE="${obj.BYTERANGE}"`);
        if (obj.GAP) attrs.push(`GAP=${obj.GAP}`);
        return `${TAG}:${attrs.join(',')}` as any;
    },
});

export type EXT_X_PART_STRING_TYPE = `#EXT-X-PART:${string}`;
