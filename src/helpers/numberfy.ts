import { Ify } from './helper-types';

type Numberfy<T extends Ify<string>> = T extends string ? number : undefined;
export function numberfy<T extends Ify<string>>(str: T): Numberfy<T> {
    if (str) return +str as Numberfy<T>;
    return undefined as Numberfy<T>;
}
