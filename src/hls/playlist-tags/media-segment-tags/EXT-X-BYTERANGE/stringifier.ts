import { EXT_X_BYTERANGE_PARSED, EXT_X_BYTERANGE_STRING } from './types';

export default function (val: EXT_X_BYTERANGE_PARSED) {
    const LENGTH = val.LENGTH;
    const OFFSET = val.OFFSET;
    return OFFSET
        ? `#EXT-X-BYTERANGE:${LENGTH}@${OFFSET}`
        : (`#EXT-X-BYTERANGE:${LENGTH}` as const satisfies EXT_X_BYTERANGE_STRING);
}
