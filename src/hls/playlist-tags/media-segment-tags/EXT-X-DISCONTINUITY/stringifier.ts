import { EXT_X_DISCONTINUITY_STRING } from './types';

/**
 * Stringifier for EXT-X-DISCONTINUITY tag
 * 
 * RFC 8216 Section 4.3.6.1:
 * - The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
 *   Media Segment that follows it and the one that preceded it.
 * - Its format is: #EXT-X-DISCONTINUITY
 */
export function extXDiscontinuityStringifier(): EXT_X_DISCONTINUITY_STRING {
    return '#EXT-X-DISCONTINUITY\n' as const;
} 