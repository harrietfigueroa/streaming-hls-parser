import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { IsDecimalInteger } from '../../../../helpers/decimal-integer';
import { StringToNumber } from '../../../../helpers/string-to-number';

// Main parser type that returns the appropriate type based on input
type ExtXMediaSequenceParser<T extends string> =
    T extends `#EXT-X-MEDIA-SEQUENCE:${infer Value}`
    ? IsDecimalInteger<Value> extends true
    ? StringToNumber<Value>
    : never
    : never;

export function extXMediaSequenceParser<T extends string>(str: T): ExtXMediaSequenceParser<T> {
    const value = colonSeparated(str);
    const num = parseInt(value, 10);

    // Return undefined if not a valid number
    if (isNaN(num)) {
        return undefined as ExtXMediaSequenceParser<T>;
    }

    return num as unknown as ExtXMediaSequenceParser<T>;
} 