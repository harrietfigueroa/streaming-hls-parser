export function isUri(line: string) {
    return line.trimStart()[0] !== '#';
}
