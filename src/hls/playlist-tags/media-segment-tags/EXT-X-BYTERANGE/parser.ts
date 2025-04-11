import { numberfy } from '../../../../helpers/numberfy';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_BYTERANGE_PARSED, EXT_X_BYTERANGE_STRING } from './types';

export default function <T extends EXT_X_BYTERANGE_STRING>(str: T): EXT_X_BYTERANGE_PARSED<T> {
    const attrs = colonSeparated(str);
    const [LENGTH, OFFSET] = attrs.split('@').map(numberfy);
    return { LENGTH, OFFSET };
}

function hasSecondParam(str: string): str is `${string}@${string}` {
    return str.includes('@');
}
