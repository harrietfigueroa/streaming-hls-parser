import { EXT_X_MAP_PARSED, EXT_X_MAP_STRING } from './types';

export default function (val: EXT_X_MAP_PARSED) {
    const BYTERANGE = val.BYTERANGE;
    const URI = val.URI;

    const attrs = [`URI="${URI}"`];

    if (BYTERANGE) {
        attrs.push(`BYTERANGE=${BYTERANGE}`);
    }

    return `#EXT-X-MAP:${attrs.join(',')}` as const satisfies EXT_X_MAP_STRING;
}
