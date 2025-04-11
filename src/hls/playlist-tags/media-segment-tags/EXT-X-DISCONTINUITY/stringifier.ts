import { EXT_X_DISCONTINUITY_STRING } from './types';

export default function () {
    return `#EXT-X-DISCONTINUITY` as const satisfies EXT_X_DISCONTINUITY_STRING;
}
