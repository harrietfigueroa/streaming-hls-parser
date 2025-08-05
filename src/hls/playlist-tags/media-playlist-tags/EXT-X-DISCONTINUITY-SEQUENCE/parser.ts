import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { IsDecimalInteger } from '../../../../helpers/decimal-integer';
import { StringToNumber } from '../../../../helpers/string-to-number';

// Main parser type that returns the appropriate type based on input
type ExtXDiscontinuitySequenceParser<T extends string> =
    T extends `#EXT-X-DISCONTINUITY-SEQUENCE:${infer Value}`
    ? IsDecimalInteger<Value> extends true
    ? StringToNumber<Value>
    : undefined
    : number | undefined;

export function extXDiscontinuitySequenceParser<T extends string>(str: T): ExtXDiscontinuitySequenceParser<T> {
    const value = colonSeparated(str);

    // Attempt to parse as integer
    const num = parseInt(value, 10);

    // Return undefined if not a valid number
    if (isNaN(num)) {
        return undefined as ExtXDiscontinuitySequenceParser<T>;
    }

    return num as ExtXDiscontinuitySequenceParser<T>;
} 