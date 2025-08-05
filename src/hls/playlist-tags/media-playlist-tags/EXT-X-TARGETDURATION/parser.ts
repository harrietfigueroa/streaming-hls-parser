import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { IsDecimalInteger } from '../../../../helpers/decimal-integer';
import { StringToNumber } from '../../../../helpers/string-to-number';

// Main parser type that returns the appropriate type based on input
type ExtXTargetDurationParser<T extends string> =
    T extends `#EXT-X-TARGETDURATION:${infer Value}`
    ? IsDecimalInteger<Value> extends true
    ? StringToNumber<Value>
    : never
    : never;

export function extXTargetDurationParser<T extends string>(str: T): ExtXTargetDurationParser<T> {
    const value = colonSeparated(str);
    const num = parseInt(value, 10);

    // Return undefined if not a valid number
    if (isNaN(num)) {
        return undefined as ExtXTargetDurationParser<T>;
    }

    return num as unknown as ExtXTargetDurationParser<T>;
} 