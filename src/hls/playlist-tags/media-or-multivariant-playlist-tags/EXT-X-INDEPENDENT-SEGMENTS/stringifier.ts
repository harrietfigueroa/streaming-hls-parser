import { EXT_X_INDEPENDENT_SEGMENTS_STRING } from './types';

export default function () {
    return '#EXT-X-INDEPENDENT-SEGMENTS' as const satisfies EXT_X_INDEPENDENT_SEGMENTS_STRING;
}
