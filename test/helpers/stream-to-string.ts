import { Readable } from 'node:stream';

export async function streamToString(readable: Readable): Promise<string> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString();
}
