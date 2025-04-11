import { EXT_X_ENDLIST_STRING } from './types';

export default function () {
    return '#EXT-X-ENDLIST' as const satisfies EXT_X_ENDLIST_STRING;
}
