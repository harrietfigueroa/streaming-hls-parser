import { EXT_X_VERSION_STRING, EXT_X_VERSION_PARSED } from './types';

export function extXVersionStringifier(val: EXT_X_VERSION_PARSED): EXT_X_VERSION_STRING {
    if (val === undefined) {
        throw new Error('Cannot stringify undefined value');
    }
    return `#EXT-X-VERSION:${val}` as const;
} 