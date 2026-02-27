import { TestFiles, loadTestFileAsIterable } from '../../test/helpers/load-test-file';
import { NewlineTransformer } from './newline.transformer';
import { HlsLexicalTransformer } from './hls-lexical.transformer';
import { describe, expect, it } from 'vitest';

// Helper to create a ReadableStream with polyfill support
function toReadableStream<T>(source: Iterable<T> | AsyncIterable<T>): ReadableStream<T> {
    // @ts-expect-error - ReadableStream.from exists in newer environments but not in all DOM typings
    if (typeof ReadableStream.from === 'function') {
        // @ts-expect-error - ReadableStream.from exists in newer environments but not in all DOM typings
        return ReadableStream.from(source as AsyncIterable<T>);
    }
    return new ReadableStream<T>({
        async start(controller) {
            try {
                for await (const chunk of source) {
                    controller.enqueue(chunk);
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        }
    });
}

describe('HLS Lexical Transformer', (): void => {
    it('should parse stuff', async (): Promise<void> => {
        // Create Web Streams pipeline
        const source = loadTestFileAsIterable(TestFiles.LIVE_PLAYLIST);
        const inputStream = toReadableStream(source);
        const transformedStream = inputStream
            .pipeThrough(new NewlineTransformer())
            .pipeThrough(new HlsLexicalTransformer());

        const reader = transformedStream.getReader();
        try {
            while (true) {
                const { done, value: line } = await reader.read();
                if (done) break;
                expect(line).toHaveProperty('type');
                expect(line.type).toBeDefined();
                expect(line.source).toBeDefined();
            }
        } finally {
            reader.releaseLock();
        }
    });

    it('should tokenize tag lines', async () => {
        const lines = ['#EXTM3U', '#EXT-X-VERSION:3', 'segment.ts'];
        const inputStream = toReadableStream(lines);
        const transformedStream = inputStream.pipeThrough(new HlsLexicalTransformer());

        const tokens = [];
        const reader = transformedStream.getReader();
        try {
            while (true) {
                const { done, value: token } = await reader.read();
                if (done) break;
                tokens.push(token);
            }
        } finally {
            reader.releaseLock();
        }

        expect(tokens).toHaveLength(3);
        expect(tokens[0].type).toBe('#EXTM3U');
        expect(tokens[1].type).toBe('#EXT-X-VERSION');
        expect(tokens[2].type).toBe('URI');
    });
});
