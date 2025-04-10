import { colonSeparated } from '../../../parse-helpers/colon-separated';

type ByteRangeSingleParam = number;
type ByteRangeDoubleParam = [number, number];
type ByteRangeReturnType<T> = T extends `${string}@${string}`
    ? ByteRangeDoubleParam
    : ByteRangeDoubleParam | ByteRangeSingleParam;

export default function <T extends string>(str: T): ByteRangeReturnType<T> {
    if (hasSecondParam(str)) {
        // Tag looks like this:
        // '#EXT-X-BYTERANGE:16920@49256';
        const [first, second] = str.split('@');
        return [+colonSeparated(first), +second] as ByteRangeReturnType<T>;
    }
    // Tag looks like this:
    // '#EXT-X-BYTERANGE:16920';
    return +colonSeparated(str) as ByteRangeReturnType<T>;
}

function hasSecondParam(str: string): str is `${string}@${string}` {
    return str.includes('@');
}
