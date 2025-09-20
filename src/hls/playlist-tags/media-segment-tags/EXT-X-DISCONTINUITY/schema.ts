import * as z from 'zod';

export const TAG = '#EXT-X-DISCONTINUITY' as const;
export const EXT_X_DISCONTINUITY_STRING = z.literal(TAG);

/**
 * The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
 * Media Segment that follows it and the one that preceded it.
 *
 * RFC 8216 Section 4.3.6.1:
 * - The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
 *   Media Segment that follows it and the one that preceded it.
 * - Its format is: #EXT-X-DISCONTINUITY
 */
export const EXT_X_DISCONTINUITY_CODEC = z.codec(EXT_X_DISCONTINUITY_STRING, z.literal(true), {
    decode: () => true as const,
    encode: () => TAG,
});
