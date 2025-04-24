import { parseHLSTag } from '../hls/hls-tag';
import { PLAYLIST_TAGS } from '../hls/hls.types';
import { isUri } from '../hls/isUri';
import { LexicalToken } from './parser.interfaces';

export function tokenizeLine(line: string): LexicalToken {
    if (isUri(line)) {
        return {
            type: 'URI',
            source: line,
            value: undefined,
        };
    }

    // Casting is safe here because any unknown tag, custom tags for example,
    // will be added to the global symbol registry
    const tag = parseHLSTag(line as PLAYLIST_TAGS);
    return {
        type: tag,
        source: line,
        value: undefined,
    };
}
