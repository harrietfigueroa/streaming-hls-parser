import { EXT_X_ENDLIST_STRING } from './types';

export function extXEndListStringifier(): EXT_X_ENDLIST_STRING {
    return '#EXT-X-ENDLIST\n' as const;
}
