import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_PROGRAM_DATE_TIME_PARSED } from './types';

export default function (str: string): EXT_X_PROGRAM_DATE_TIME_PARSED {
    const strDate = colonSeparated(str);
    return new Date(strDate);
}
