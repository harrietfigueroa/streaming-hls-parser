import { colonSeparated } from '../../common/colon-separated';

export function discontinuitySequenceParser(str: string): number {
    return +colonSeparated(str);
}
