import { EXT_X_START_PARSED, EXT_X_START_STRING } from './types';

export default function (value: EXT_X_START_PARSED) {
    const TIME_OFFSET = value['TIME-OFFSET'];
    const PRECISE = value['PRECISE'];
    const preciseString = PRECISE ? `:${PRECISE}` : '';
    return `#EXT-X-START:${TIME_OFFSET}${preciseString}` as const satisfies EXT_X_START_STRING;
}
