# Examples

This directory contains example HLS playlists and usage examples for the `streaming-hls-parser` library.

## Example Playlists

- **live-playlist.m3u8** - A live/sliding window media playlist
- **vod-playlist.m3u8** - A video-on-demand media playlist
- **very-large-playlist.m3u8** - A large media playlist for testing performance
- **multi-variant-playlist.m3u8** - A multivariant (master) playlist with multiple streams

## Usage Examples

### Browser Usage

See [browser-usage.ts](./browser-usage.ts) for comprehensive browser examples including:

- ✅ Parsing from `fetch()` responses
- ✅ Parsing from File API (user uploads)
- ✅ Creating custom ReadableStreams
- ✅ Using revivers to transform tokens
- ✅ Validation and error handling
- ✅ Progress tracking during parsing
- ✅ React component integration

**Live Demo**: Open [browser-fetch-example.html](./browser-fetch-example.html) in a browser to see a working example.

### Node.js Usage

See [node-usage.ts](./node-usage.ts) for comprehensive Node.js examples including:

- ✅ Parsing from file paths
- ✅ Parsing from file streams
- ✅ Parsing from HTTP/HTTPS requests
- ✅ Using Node.js 18+ fetch API
- ✅ Custom async iterables
- ✅ Batch processing multiple playlists
- ✅ File watching and re-parsing

## Quick Start

### Browser (ES Modules)

```typescript
import { HLS } from 'streaming-hls-parser';

// Parse from a fetch response
const response = await fetch('playlist.m3u8');
const playlist = await HLS.parseMediaPlaylist(response.body);

console.log('Segments:', playlist.segments.length);
```

### Node.js

```typescript
import { HLS } from 'streaming-hls-parser';
import { createReadStream } from 'fs';

// Parse from a file stream
const stream = createReadStream('playlist.m3u8', { encoding: 'utf-8' });
const playlist = await HLS.parseMediaPlaylist(stream);

console.log('Segments:', playlist.segments.length);
```

### From String

```typescript
import { HLS } from 'streaming-hls-parser';

const hlsString = `
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
segment1.ts
#EXT-X-ENDLIST
`;

const playlist = HLS.parse(hlsString);
console.log('Type:', playlist instanceof MediaPlaylist ? 'Media' : 'Multivariant');
```

## Features Demonstrated

### Web Streams API Support

All examples use the Web Streams API for cross-platform compatibility:

- ✅ Works in browsers
- ✅ Works in Node.js 16.5+
- ✅ Works in Deno
- ✅ Works in Bun

### Streaming Parsing

Efficiently parse large playlists by processing chunks as they arrive:

```typescript
// Browser
const response = await fetch(url);
const playlist = await HLS.parseMediaPlaylist(response.body);

// Node.js
const stream = createReadStream(path);
const playlist = await HLS.parseMediaPlaylist(stream);
```

### Reviver Functions

Transform tokens during parsing:

```typescript
const playlist = await HLS.parseMediaPlaylist(stream, (token) => {
    console.log('Parsing:', token.type);
    return token;
});
```

### Validation

Check for RFC 8216 compliance:

```typescript
const { playlist, errors } = HLS.validate(hlsString);

if (errors.length > 0) {
    console.log('Validation errors:', errors);
}
```

### Stringification

Convert playlists back to HLS format:

```typescript
const output = HLS.stringify(playlist, undefined, {
    lineEndings: '\r\n' // Custom line endings
});
```

## Running the Examples

### TypeScript Examples

```bash
# Install dependencies
npm install

# Run a Node.js example with ts-node
npx ts-node examples/node-usage.ts

# Or compile and run
npm run build
node dist/examples/node-usage.js
```

### Browser Example

```bash
# Serve the examples directory
npx http-server examples

# Open http://localhost:8080/browser-fetch-example.html
```

## Platform Compatibility

| Platform | Support | Notes |
|----------|---------|-------|
| Chrome/Edge 89+ | ✅ | Full Web Streams support |
| Firefox 102+ | ✅ | Full Web Streams support |
| Safari 14.1+ | ✅ | Full Web Streams support |
| Node.js 16.5+ | ✅ | Web Streams API available |
| Node.js 20+ | ✅ | ReadableStream.from() available |
| Deno | ✅ | Full Web Streams support |
| Bun | ✅ | Full Web Streams support |

## Additional Resources

- [RFC 8216 - HTTP Live Streaming](https://datatracker.ietf.org/doc/html/rfc8216)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Node.js Streams](https://nodejs.org/api/stream.html)
