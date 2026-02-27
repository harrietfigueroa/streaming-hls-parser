import * as z from 'zod';

export const TAG = '#EXT-X-CUE-OUT' as const;

/**
 * The EXT-X-CUE-OUT tag marks the start of an ad break in HLS streams.
 * This is a widely-used industry standard tag for SCTE-35 ad insertion
 * workflows, supported by AWS Elemental MediaTailor, MediaLive, Google
 * Ad Manager, and other SSAI platforms.
 *
 * Its format is:
 *
 * #EXT-X-CUE-OUT:<duration>
 * #EXT-X-CUE-OUT:DURATION=<duration>
 * #EXT-X-CUE-OUT
 *
 * where duration is a decimal-floating-point number representing the
 * duration of the ad break in seconds. The duration may be omitted,
 * and the format may use either the short form (colon + number) or
 * the attribute form (DURATION=number).
 *
 * The EXT-X-CUE-OUT tag applies to the next Media Segment and indicates
 * the beginning of an ad avail. It is typically paired with EXT-X-CUE-IN
 * to mark the end of the ad break.
 *
 * Reference: AWS Elemental MediaTailor HLS Ad Markers
 * https://docs.aws.amazon.com/mediatailor/latest/ug/hls-ad-markers.html
 */
export const EXT_X_CUE_OUT_STRING = z.string().startsWith(TAG);

export const EXT_X_CUE_OUT_OBJECT = z
    .object({
        DURATION: z.coerce.number().min(0).optional(),
    })
    .describe(`
    The EXT-X-CUE-OUT tag marks the start of an ad break in HLS streams.
    This is a widely-used industry standard tag for SCTE-35 ad insertion
    workflows, supported by AWS Elemental MediaTailor, MediaLive, Google
    Ad Manager, and other SSAI platforms.

    Its format is:

    #EXT-X-CUE-OUT:<duration>
    #EXT-X-CUE-OUT:DURATION=<duration>
    #EXT-X-CUE-OUT

    where duration is a decimal-floating-point number representing the
    duration of the ad break in seconds. The duration may be omitted,
    and the format may use either the short form (colon + number) or
    the attribute form (DURATION=number).

    The EXT-X-CUE-OUT tag applies to the next Media Segment and indicates
    the beginning of an ad avail. It is typically paired with EXT-X-CUE-IN
    to mark the end of the ad break.

    Reference: AWS Elemental MediaTailor HLS Ad Markers
    https://docs.aws.amazon.com/mediatailor/latest/ug/hls-ad-markers.html
`);

export const EXT_X_CUE_OUT_CODEC = z.codec(EXT_X_CUE_OUT_STRING, EXT_X_CUE_OUT_OBJECT, {
    decode: (value) => {
        const content = value.substring(TAG.length);

        // No duration specified
        if (!content || content.length === 0) {
            return {};
        }

        // Remove leading colon if present
        const trimmed = content.startsWith(':') ? content.substring(1) : content;

        // Check if it's the DURATION= format
        if (trimmed.startsWith('DURATION=')) {
            const durationStr = trimmed.substring('DURATION='.length);
            return {
                DURATION: parseFloat(durationStr),
            };
        }

        // Otherwise, treat it as a simple number
        return {
            DURATION: parseFloat(trimmed),
        };
    },
    encode: (obj) => {
        if (obj.DURATION === undefined) {
            return TAG as any;
        }
        // Use short form (colon + number)
        return `${TAG}:${obj.DURATION}` as any;
    },
});

export type EXT_X_CUE_OUT_STRING_TYPE = '#EXT-X-CUE-OUT' | `#EXT-X-CUE-OUT:${string}`;
