import { parseTokenizedLine } from '../parser/parse-tokenized-line';
import { LexicalToken, Reviver } from '../parser/parser.interfaces';

/**
 * HlsParseTransformer - Parses lexical tokens and validates them using Zod schemas
 *
 * Uses Web Streams API for cross-platform compatibility (browsers, Node.js 16.5+, Deno, Bun)
 *
 * Takes LexicalToken objects and:
 * - Parses/validates the source using safeDecode (lenient parsing)
 * - Populates the value field with parsed data
 * - Collects validation errors in the errors field
 * - Optionally applies a reviver function to transform tokens
 */
export class HlsParseTransformer extends TransformStream<LexicalToken, LexicalToken> {
    constructor(reviver?: Reviver) {
        super({
            transform(token, controller) {
                // Parse and validate the token
                let parsedToken = parseTokenizedLine(token);

                // Apply reviver if provided
                if (reviver) {
                    parsedToken = reviver(parsedToken);
                }

                // Only enqueue if token has content
                if (parsedToken) {
                    controller.enqueue(parsedToken);
                }
            }
        });
    }
}
