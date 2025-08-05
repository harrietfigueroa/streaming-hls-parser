import { EXT_X_MEDIA_SEQUENCE_STRING } from './types';

export function extXMediaSequenceStringifier<mediaSequence extends number>(val: mediaSequence): EXT_X_MEDIA_SEQUENCE_STRING<mediaSequence> {
    return `#EXT-X-MEDIA-SEQUENCE:${val}` as const;
} 