import HLSTag from '../hls/hls-tag';
import { PLAYLIST_TAGS } from '../hls/hls.types';
import { isUri } from '../hls/isUri';
import { LexicalToken } from './parser.interfaces';

export function tokenizeLine(line: string): LexicalToken {
    if (isUri(line)) {
        return {
            type: HLSTag('URI'),
            source: line,
            value: undefined,
        };
    }

    // Casting is safe here because any unknown tag, custom tags for example,
    // will be added to the global symbol registry
    const tagSymbol: symbol = HLSTag(line as PLAYLIST_TAGS);
    return {
        type: tagSymbol,
        source: line,
        value: undefined,
    };
}
