/**
 * NewlineTransformer - Splits incoming string or binary chunks into complete lines
 *
 * Uses Web Streams API for cross-platform compatibility (browsers, Node.js 16.5+, Deno, Bun)
 *
 * Features:
 * - Handles incomplete lines by buffering remainder
 * - Decodes Uint8Array to UTF-8 strings using TextDecoder
 * - Splits on \n newlines
 * - Flushes any remaining content on stream end
 */
export class NewlineTransformer extends TransformStream<string | Uint8Array, string> {
    constructor() {
        let remainder = '';
        const decoder = new TextDecoder('utf-8');

        super({
            transform(chunk, controller) {
                // Convert Uint8Array to string if needed
                const text = typeof chunk === 'string'
                    ? chunk
                    : decoder.decode(chunk, { stream: true });

                // Split on newlines, combining with any buffered remainder
                const lines = (remainder + text).split('\n');

                // Last item might be incomplete - save it for next chunk
                remainder = lines.pop() || '';

                // Enqueue all complete lines
                for (const line of lines) {
                    controller.enqueue(line);
                }
            },

            flush(controller) {
                // Flush any remaining content when stream ends
                if (remainder) {
                    controller.enqueue(remainder);
                }
            }
        });
    }
}
