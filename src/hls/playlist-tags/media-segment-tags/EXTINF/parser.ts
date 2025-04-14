import { numberfy } from '../../../../helpers/numberfy';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXTINF_PARSED } from './types';

export default function (str: string): EXTINF_PARSED {
    const strValue = colonSeparated(str);
    const commaIndex = strValue.indexOf(',');

    return {
        DURATION: numberfy(strValue.slice(0, commaIndex)),
        TITLE: strValue.slice(commaIndex + 1),
    };
}
