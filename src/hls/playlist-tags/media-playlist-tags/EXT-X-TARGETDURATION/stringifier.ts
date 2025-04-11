import { EXT_X_TARGETDURATION_PARSED, EXT_X_TARGETDURATION_STRING } from './types';

export default function (val: EXT_X_TARGETDURATION_PARSED) {
    return `#EXT-X-TARGETDURATION:${val}` as const satisfies EXT_X_TARGETDURATION_STRING;
}
