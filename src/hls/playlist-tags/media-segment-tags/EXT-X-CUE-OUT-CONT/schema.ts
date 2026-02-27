import * as z from 'zod';

export const TAG = '#EXT-X-CUE-OUT-CONT' as const;

/**
 * The EXT-X-CUE-OUT-CONT tag is a continuation marker that appears
 * during an ongoing ad break in HLS streams. This is used in SCTE-35
 * ad insertion workflows to track progress through the ad avail.
 *
 * Its format is:
 *
 * #EXT-X-CUE-OUT-CONT:<elapsed>/<duration>
 *
 * where:
 * - elapsed: decimal-floating-point number of seconds elapsed in the ad break
 * - duration: decimal-floating-point number for total ad break duration
 *
 * Example: #EXT-X-CUE-OUT-CONT:8.308/30
 * This indicates 8.308 seconds have elapsed in a 30-second ad break.
 *
 * The EXT-X-CUE-OUT-CONT tag is generated for each segment during an
 * active ad break, appearing alongside the initial EXT-X-CUE-OUT marker
 * and before the final EXT-X-CUE-IN marker.
 *
 * Reference: Industry standard for SCTE-35 HLS ad insertion
 */
export const EXT_X_CUE_OUT_CONT_STRING = z.string().startsWith(TAG);

export const EXT_X_CUE_OUT_CONT_OBJECT = z
    .object({
        ELAPSED: z.coerce.number().min(0),
        DURATION: z.coerce.number().min(0),
    })
    .describe(`
    The EXT-X-CUE-OUT-CONT tag is a continuation marker that appears
    during an ongoing ad break in HLS streams. This is used in SCTE-35
    ad insertion workflows to track progress through the ad avail.

    Its format is:

    #EXT-X-CUE-OUT-CONT:<elapsed>/<duration>

    where:
    - elapsed: decimal-floating-point number of seconds elapsed in the ad break
    - duration: decimal-floating-point number for total ad break duration

    Example: #EXT-X-CUE-OUT-CONT:8.308/30
    This indicates 8.308 seconds have elapsed in a 30-second ad break.

    The EXT-X-CUE-OUT-CONT tag is generated for each segment during an
    active ad break, appearing alongside the initial EXT-X-CUE-OUT marker
    and before the final EXT-X-CUE-IN marker.

    Reference: Industry standard for SCTE-35 HLS ad insertion
`);

export const EXT_X_CUE_OUT_CONT_CODEC = z.codec(
    EXT_X_CUE_OUT_CONT_STRING,
    EXT_X_CUE_OUT_CONT_OBJECT,
    {
        decode: (value) => {
            // Extract the elapsed/duration part after the tag and colon
            const content = value.substring(TAG.length + 1).trim();

            // Parse the elapsed/duration format
            const parts = content.split('/');
            if (parts.length !== 2) {
                throw new Error('EXT-X-CUE-OUT-CONT must have format <elapsed>/<duration>');
            }

            return {
                ELAPSED: parseFloat(parts[0]),
                DURATION: parseFloat(parts[1]),
            };
        },
        encode: (obj) => {
            return `${TAG}:${obj.ELAPSED}/${obj.DURATION}` as any;
        },
    },
);

export type EXT_X_CUE_OUT_CONT_STRING_TYPE = `#EXT-X-CUE-OUT-CONT:${string}`;
