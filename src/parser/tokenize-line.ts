import { parseHLSTag } from '../hls/hls-tag';
import { isUri } from '../hls/isUri';
import { AllPlaylistTags, LexicalToken } from './parser.interfaces';

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
    const tag = parseHLSTag(line as AllPlaylistTags);
    return {
        type: tag,
        source: line,
        value: undefined,
    };
}
