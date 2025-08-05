import { EXT_X_I_FRAMES_ONLY_PARSED } from './types';

export function extXIFramesOnlyParser(str: string | undefined): EXT_X_I_FRAMES_ONLY_PARSED {
    // Return false for undefined input
    if (str === undefined) {
        return false;
    }

    // Return true for any non-empty string
    return true;
} 