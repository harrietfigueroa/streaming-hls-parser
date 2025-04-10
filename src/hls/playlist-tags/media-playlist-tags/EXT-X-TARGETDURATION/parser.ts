import { numberfy } from '../../../../helpers/numberfy';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_TARGETDURATION_PARSED } from './types';

export default function (str: string): EXT_X_TARGETDURATION_PARSED {
    return numberfy(colonSeparated(str));
}
