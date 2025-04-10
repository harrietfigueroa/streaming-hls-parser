import { Ify } from './helper.types';

type Numberfy<T extends Ify<string>> = T extends string ? number : undefined;

/**
 * Returns the input as a number if it is a string, otherwise returns null.
 * @param str
 * @returns
 */
export function numberfy<T extends Ify<string>>(str: T): Numberfy<T> {
    if (str) return +str as Numberfy<T>;
    return undefined as Numberfy<T>;
}
