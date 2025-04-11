import { EXT_X_VERSION_PARSED, EXT_X_VERSION_STRING } from './types';

export default function (val: EXT_X_VERSION_PARSED) {
    return `#EXT-X-VERSION:${val}` as const satisfies EXT_X_VERSION_STRING;
}
