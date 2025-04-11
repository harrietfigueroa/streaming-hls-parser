import { EXT_X_MEDIA_SEQUENCE_PARSED, EXT_X_MEDIA_SEQUENCE_STRING } from './types';

export default function (val: EXT_X_MEDIA_SEQUENCE_PARSED) {
    return `#EXT-X-MEDIA-SEQUENCE:${val}` as const satisfies EXT_X_MEDIA_SEQUENCE_STRING;
}
