import { Ify } from './helper-types';

type YESNO = '"YES"' | '"NO"';
type YESNOIFY<T extends Ify<string>> = T extends string ? YESNO : YESNO | undefined;
export function yesnoify<T extends Ify<string>>(str: T): YESNOIFY<T> {
    if (str) return str as YESNOIFY<T>;
    return undefined as YESNOIFY<T>;
}
