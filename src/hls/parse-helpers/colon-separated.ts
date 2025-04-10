/**
 * Splits the string by the first colon and returns the second part.
 * @param str
 * @returns
 */
export function colonSeparated(str: string): string {
    const [key, value] = str.split(':');
    return value;
}
