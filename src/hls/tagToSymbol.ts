import { HLS_TAG_TYPES } from './hls.constants';

const tagsAndSymbols: [string, symbol][] = Object.entries(HLS_TAG_TYPES);
export function tagToSymbol(str: unknown): symbol | null {
    if (typeof str === 'string') {
        let tag: symbol = HLS_TAG_TYPES[str as keyof typeof HLS_TAG_TYPES];
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
