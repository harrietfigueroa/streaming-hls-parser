import { EXT_X_DISCONTINUITY_SEQUENCE_STRING } from './types';

export function extXDiscontinuitySequenceStringifier(val: number | undefined): string {
    if (val === undefined) {
        throw new Error('Cannot stringify undefined value');
    }
    return `#EXT-X-DISCONTINUITY-SEQUENCE:${val}`;
} 