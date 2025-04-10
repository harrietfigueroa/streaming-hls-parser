import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_BYTERANGE_PARSED, EXT_X_BYTERANGE_STRING } from './types';

export default function <T extends EXT_X_BYTERANGE_STRING>(str: T): EXT_X_BYTERANGE_PARSED<T> {
    if (hasSecondParam(str)) {
        // Tag looks like this:
        // '#EXT-X-BYTERANGE:16920@49256';
        const [first, second] = str.split('@');
        return [+colonSeparated(first), +second] as EXT_X_BYTERANGE_PARSED<T>;
    }
    // Tag looks like this:
    // '#EXT-X-BYTERANGE:16920';
    return +colonSeparated(str) as EXT_X_BYTERANGE_PARSED<T>;
}

function hasSecondParam(str: string): str is `${string}@${string}` {
    return str.includes('@');
}
