import { colonSeparated } from '../../common/colon-separated';

export default function (str: string): number {
    return +colonSeparated(str);
}
