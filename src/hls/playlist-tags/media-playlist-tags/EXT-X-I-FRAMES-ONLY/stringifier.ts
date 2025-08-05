import { EXT_X_I_FRAMES_ONLY_STRING } from './types';

export function extXIFramesOnlyStringifier(): EXT_X_I_FRAMES_ONLY_STRING {
    return '#EXT-X-I-FRAMES-ONLY' as const;
} 