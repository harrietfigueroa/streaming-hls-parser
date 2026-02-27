import * as z from 'zod';

export const TAG = '#EXT-X-GAP' as const;
export const EXT_X_GAP_STRING = z.templateLiteral([TAG]);

/**
 * The EXT-X-GAP tag indicates that the segment URI to which it applies
 * does not contain media data and SHOULD NOT be loaded by clients.
 *
 * Its format is:
 *
 * #EXT-X-GAP
 *
 * The EXT-X-GAP tag applies only to the next Media Segment. This tag is
 * useful in live streaming scenarios where segments may be temporarily
 * unavailable.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.4.7
 */
export const EXT_X_GAP_OBJECT = z.literal(true).readonly().describe(`
    The EXT-X-GAP tag indicates that the segment URI to which it applies
    does not contain media data and SHOULD NOT be loaded by clients.

    Its format is:

    #EXT-X-GAP

    The EXT-X-GAP tag applies only to the next Media Segment. This tag is
    useful in live streaming scenarios where segments may be temporarily
    unavailable.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.4.7
`);

export const EXT_X_GAP_CODEC = z.codec(EXT_X_GAP_STRING, EXT_X_GAP_OBJECT, {
    decode: (value) => {
        return true as const;
    },
    encode: (obj) => {
        return TAG as any;
    },
});

export type EXT_X_GAP_STRING_TYPE = '#EXT-X-GAP';
