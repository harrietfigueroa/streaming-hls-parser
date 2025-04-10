import { colonSeparated } from '../../../parse-helpers/colon-separated';

export default function (str: string): number {
    return +colonSeparated(str);
}
