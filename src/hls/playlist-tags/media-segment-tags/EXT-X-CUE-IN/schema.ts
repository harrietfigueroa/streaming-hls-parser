import * as z from 'zod';

export const TAG = '#EXT-X-CUE-IN' as const;

/**
 * The EXT-X-CUE-IN tag marks the end of an ad break in HLS streams.
 * This is a widely-used industry standard tag for SCTE-35 ad insertion
 * workflows, supported by AWS Elemental MediaTailor, MediaLive, Google
 * Ad Manager, and other SSAI platforms.
 *
 * Its format is:
 *
 * #EXT-X-CUE-IN
 *
 * The EXT-X-CUE-IN tag has no attributes and applies to the next Media
 * Segment. It indicates the end of an ad avail and is paired with
 * EXT-X-CUE-OUT to demarcate ad break boundaries.
 *
 * When MediaTailor encounters EXT-X-CUE-IN, it marks the return to main
 * content and typically inserts an EXT-X-DISCONTINUITY tag to signal the
 * transition.
 *
 * Reference: AWS Elemental MediaTailor HLS Ad Markers
 * https://docs.aws.amazon.com/mediatailor/latest/ug/hls-ad-markers.html
 */
export const EXT_X_CUE_IN_STRING = z.templateLiteral([TAG]);

export const EXT_X_CUE_IN_OBJECT = z.literal(true).readonly().describe(`
    The EXT-X-CUE-IN tag marks the end of an ad break in HLS streams.
    This is a widely-used industry standard tag for SCTE-35 ad insertion
    workflows, supported by AWS Elemental MediaTailor, MediaLive, Google
    Ad Manager, and other SSAI platforms.

    Its format is:

    #EXT-X-CUE-IN

    The EXT-X-CUE-IN tag has no attributes and applies to the next Media
    Segment. It indicates the end of an ad avail and is paired with
    EXT-X-CUE-OUT to demarcate ad break boundaries.

    When MediaTailor encounters EXT-X-CUE-IN, it marks the return to main
    content and typically inserts an EXT-X-DISCONTINUITY tag to signal the
    transition.

    Reference: AWS Elemental MediaTailor HLS Ad Markers
    https://docs.aws.amazon.com/mediatailor/latest/ug/hls-ad-markers.html
`);

export const EXT_X_CUE_IN_CODEC = z.codec(EXT_X_CUE_IN_STRING, EXT_X_CUE_IN_OBJECT, {
    decode: (value) => {
        return true as const;
    },
    encode: (obj) => {
        return TAG as any;
    },
});

export type EXT_X_CUE_IN_STRING_TYPE = '#EXT-X-CUE-IN';
