import { EXT_X_INDEPENDENT_SEGMENTS_STRING } from './types';

export function extXIndependentSegmentsStringifier(): EXT_X_INDEPENDENT_SEGMENTS_STRING {
    return '#EXT-X-INDEPENDENT-SEGMENTS' as const;
}
