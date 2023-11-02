export function versionTagParser(str: string): number {
    const [key, value] = str.split(':');
    return +value;
}
