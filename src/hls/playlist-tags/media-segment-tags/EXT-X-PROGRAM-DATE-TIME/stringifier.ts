import { EXT_X_PROGRAM_DATE_TIME_PARSED, EXT_X_PROGRAM_DATE_TIME_STRING } from './types';

export default function (val: EXT_X_PROGRAM_DATE_TIME_PARSED) {
    const date = new Date(val).toISOString();
    return `#EXT-X-PROGRAM-DATE-TIME:${date}` as const satisfies EXT_X_PROGRAM_DATE_TIME_STRING;
}
