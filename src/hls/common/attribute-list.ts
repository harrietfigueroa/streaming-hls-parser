import { colonSeparated } from './colon-separated';

export function attributeList<T>(str: string): T {
    const attributes: string = colonSeparated(str);
    const pairs: string[][] = attributes
        .split(',')
        .map((pair: string): string[] => pair.trim().split('='));

    return Object.fromEntries(pairs);
}
