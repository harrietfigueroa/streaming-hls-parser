import { EXT_X_ENDLIST_PARSED } from './types';

export function extXEndListParser(str: string | undefined): EXT_X_ENDLIST_PARSED {
    // Return false for undefined input
    if (str === undefined) {
        return false;
    }

    // Return true for any non-empty string
    return true;
}
