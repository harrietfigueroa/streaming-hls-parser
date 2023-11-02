import { QuotedString } from '../hls/hls.types';
import { Ify } from './helper-types';

type QuotedStringify<T extends Ify<string>> = T extends string ? QuotedString : undefined;
export function quotedStringify<T extends Ify<string>>(str: T): QuotedStringify<T> {
    if (str) return str as QuotedStringify<T>;
    return undefined as QuotedStringify<T>;
}
