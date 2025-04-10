import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_VERSION_PARSED } from './types';

export default function (str: string): EXT_X_VERSION_PARSED {
    return +colonSeparated(str);
}
