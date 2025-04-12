export function backslashSeparated(str: string): string[] {
    let outStr = str;
    if (str.startsWith('"')) {
        outStr = str.slice(1, str.lastIndexOf('"'));
    }
    if (str.endsWith('"')) {
        outStr = outStr.slice(0, outStr.length - 1);
    }

    return str.split('\\');
}
