import { EXT_X_BYTERANGE_PARSED, EXT_X_BYTERANGE_STRING } from './types';

export function extXByteRangeStringifier(val: EXT_X_BYTERANGE_PARSED): EXT_X_BYTERANGE_STRING {
    const LENGTH = val.LENGTH;
    const OFFSET = val.OFFSET;
    return OFFSET !== undefined
        ? `#EXT-X-BYTERANGE:${LENGTH}@${OFFSET}`
        : `#EXT-X-BYTERANGE:${LENGTH}` as EXT_X_BYTERANGE_STRING;
} 