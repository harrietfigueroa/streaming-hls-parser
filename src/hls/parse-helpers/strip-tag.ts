export function stripTag(tag: `${string}:${string}`): string {
    return tag.slice(tag.indexOf(':') + 1);
}
