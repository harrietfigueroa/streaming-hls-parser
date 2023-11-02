import { TAG_TO_SYMBOL } from './hls.enums';

const tagsAndSymbols: [string, symbol][] = Object.entries(TAG_TO_SYMBOL);
export function tagToSymbol(str: unknown): symbol | null {
    if (typeof str === 'string') {
        let tag: symbol = TAG_TO_SYMBOL[str as keyof typeof TAG_TO_SYMBOL];
        if (tag) {
            return tag;
        }
        for (const [tag, symbol] of tagsAndSymbols) {
            if (str.startsWith(tag)) {
                return symbol;
            }
        }
    }
    return null;
}
