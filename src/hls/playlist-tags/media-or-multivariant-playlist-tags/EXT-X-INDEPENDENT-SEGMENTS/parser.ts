import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from './types';

export function extXIndependentSegmentsParser(str: string | undefined): EXT_X_INDEPENDENT_SEGMENTS_PARSED {
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
