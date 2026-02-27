import * as z from 'zod';

export const TAG = '#EXT-X-PART-INF' as const;

/**
 * The EXT-X-PART-INF tag provides information about partial segments
 * in the playlist. It is used for Low-Latency HLS (LL-HLS) streaming.
 *
 * Its format is:
 *
 * #EXT-X-PART-INF:PART-TARGET=<decimal-floating-point>
 *
 * The PART-TARGET attribute is REQUIRED and specifies the target duration
 * for each Partial Segment in seconds as a decimal-floating-point number.
 *
 * This tag applies only to Media Playlists and MUST appear before the
 * first Media Segment in the playlist.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.3.7
 */
export const EXT_X_PART_INF_STRING = z.string().startsWith(TAG);

export const EXT_X_PART_INF_OBJECT = z
    .object({
        'PART-TARGET': z.coerce.number(),
    })
    .describe(`
    The EXT-X-PART-INF tag provides information about partial segments
    in the playlist. It is used for Low-Latency HLS (LL-HLS) streaming.

    Its format is:

    #EXT-X-PART-INF:PART-TARGET=<decimal-floating-point>

    The PART-TARGET attribute is REQUIRED and specifies the target duration
    for each Partial Segment in seconds as a decimal-floating-point number.

    This tag applies only to Media Playlists and MUST appear before the
    first Media Segment in the playlist.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.3.7
`);

export const EXT_X_PART_INF_CODEC = z.codec(EXT_X_PART_INF_STRING, EXT_X_PART_INF_OBJECT, {
    decode: (value) => {
        const attributeListString = value.substring(TAG.length + 1);
        const match = attributeListString.match(/PART-TARGET=([\d.]+)/);
        if (!match) {
            throw new Error('PART-TARGET attribute is required');
        }
        return {
            'PART-TARGET': parseFloat(match[1]),
        };
    },
    encode: (obj) => {
        return `${TAG}:PART-TARGET=${obj['PART-TARGET']}` as any;
    },
});

export type EXT_X_PART_INF_STRING_TYPE = `#EXT-X-PART-INF:${string}`;
