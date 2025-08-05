import { EXT_X_PROGRAM_DATE_TIME_PARSED, EXT_X_PROGRAM_DATE_TIME_STRING } from './types';

export function extXProgramDateTimeStringifier(val: EXT_X_PROGRAM_DATE_TIME_PARSED): EXT_X_PROGRAM_DATE_TIME_STRING {
    // Use toISOString() which always outputs UTC format
    const isoString = val.toISOString();
    return `#EXT-X-PROGRAM-DATE-TIME:${isoString}` as EXT_X_PROGRAM_DATE_TIME_STRING;
} 