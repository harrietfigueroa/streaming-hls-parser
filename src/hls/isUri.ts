export function isUri(line: string) {
    return line[0] !== '#' && line !== '';
}
