import { tokenizeLine } from '../parser/tokenize-line';
import { LexicalToken } from '../parser/parser.interfaces';

/**
 * HlsLexicalTransformer - Converts HLS playlist lines into lexical tokens
 *
 * Uses Web Streams API for cross-platform compatibility (browsers, Node.js 16.5+, Deno, Bun)
 *
 * Takes string lines and produces LexicalToken objects containing:
 * - type: The tag name or 'URI'
 * - source: The original line text
 * - value: Undefined (will be set by HlsParseTransformer)
 */
export class HlsLexicalTransformer extends TransformStream<string, LexicalToken> {
    constructor() {
        super({
            transform(line, controller) {
                controller.enqueue(tokenizeLine(line));
            }
        });
    }
}
