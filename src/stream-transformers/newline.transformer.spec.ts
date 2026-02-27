import { describe, expect, it } from 'vitest';
import { TestFiles, loadTestFileAsIterable } from '../../test/helpers/load-test-file';
import { NewlineTransformer } from './newline.transformer';

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

describe('Newline Transformer', (): void => {
    it.each([
        [TestFiles.LIVE_PLAYLIST],
        [TestFiles.VERY_LARGE_PLAYLIST],
        [TestFiles.VOD_PLAYLIST],
        [TestFiles.MULTI_VARIANT_PLAYLIST],
    ])('should return an array of lines from the test file: %s', async (file: TestFiles) => {
        // Create Web Streams pipeline
        const source = loadTestFileAsIterable(file);
        const inputStream = toReadableStream(source);
        const transformedStream = inputStream.pipeThrough(new NewlineTransformer());

        const reader = transformedStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                expect(typeof value).toBe('string');
            }
        } finally {
            reader.releaseLock();
        }
    });

    it('should handle string chunks', async () => {
        const chunks = ['#EXTM3U\n#EXT-X-VERSION:', '3\n#EXT-X-TARGETDURATION:10\n'];
        const inputStream = toReadableStream(chunks);
        const transformedStream = inputStream.pipeThrough(new NewlineTransformer());

        const lines: string[] = [];
        const reader = transformedStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                lines.push(value);
            }
        } finally {
            reader.releaseLock();
        }

        expect(lines).toEqual([
            '#EXTM3U',
            '#EXT-X-VERSION:3',
            '#EXT-X-TARGETDURATION:10',
        ]);
    });

    it('should handle Uint8Array chunks', async () => {
        const encoder = new TextEncoder();
        const chunks = [
            encoder.encode('#EXTM3U\n'),
            encoder.encode('#EXT-X-VERSION:3\n'),
        ];
        const inputStream = toReadableStream(chunks);
        const transformedStream = inputStream.pipeThrough(new NewlineTransformer());

        const lines: string[] = [];
        const reader = transformedStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                lines.push(value);
            }
        } finally {
            reader.releaseLock();
        }

        expect(lines).toEqual(['#EXTM3U', '#EXT-X-VERSION:3']);
    });
});
