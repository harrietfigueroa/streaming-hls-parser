/**
 * Splits the string by the first colon and returns the second part.
 * @param str
 * @returns
 */
export function colonSeparated(str: string): string {
    const firstColon = str.indexOf(':');
    const [key, value] = [str.slice(0, firstColon + 1), str.slice(firstColon + 1)];
    return value;
}
