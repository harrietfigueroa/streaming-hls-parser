export function colonSeparated(str: string): string {
    const [key, value] = str.split(':');
    return value;
}
