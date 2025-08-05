import { EXTM3U_PARSED } from './types';

export function extM3uParser(str: string | undefined): EXTM3U_PARSED {
    // Return false for undefined input
    if (str === undefined) {
        return false;
    }

    // Return false for empty or whitespace strings
    if (!str || str.trim() === '') {
        return false;
    }

    // Return true for any non-empty string
    return true;
} 