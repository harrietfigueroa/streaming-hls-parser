import { EXT_X_TARGETDURATION_STRING } from './types';

export function extXTargetDurationStringifier<targetDuration extends number>(val: targetDuration): EXT_X_TARGETDURATION_STRING<targetDuration> {
    return `#EXT-X-TARGETDURATION:${val}` as const;
} 