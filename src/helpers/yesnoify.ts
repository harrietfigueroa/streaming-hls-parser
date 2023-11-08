import { Ify } from './helper.types';

type YESNO = 'YES' | 'NO';
type QUOTED_YESNO = '"YES"' | '"NO"';
type MAYBE_QUOTE_YESNO<T extends boolean> = T extends true ? QUOTED_YESNO : YESNO;
type YESNOIFY<T extends Ify<string>, U extends boolean> = T extends string
    ? MAYBE_QUOTE_YESNO<U>
    : MAYBE_QUOTE_YESNO<U> | undefined;
export function yesnoify<T extends Ify<string>, U extends boolean>(
    str: T,
    quoted: U,
): YESNOIFY<T, U> {
    if (str) return str as YESNOIFY<T, U>;
    return undefined as YESNOIFY<T, U>;
}
