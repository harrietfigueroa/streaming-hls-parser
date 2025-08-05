import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_PROGRAM_DATE_TIME_PARSED } from './types';

export function extXProgramDateTimeParser(str: string): EXT_X_PROGRAM_DATE_TIME_PARSED | undefined {
    try {
        const strDate = colonSeparated(str);
        const date = new Date(strDate);

        // Check if the date is valid (not NaN)
        if (isNaN(date.getTime())) {
            return undefined;
        }

        return date;
    } catch {
        return undefined;
    }
} 