import { numberfy } from '../../../../helpers/numberfy';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXTINF_PARSED } from './types';

export default function (str: string): EXTINF_PARSED {
    const strValue = colonSeparated(str);
    const [duration, title] = strValue.split(',');

    return {
        DURATION: numberfy(duration),
        TITLE: title,
    };
}
