# streaming-hls-parser

A fast, cross-platform HLS (HTTP Live Streaming) playlist parser with support for both streaming and string input. Built with Web Streams API for maximum compatibility across browsers, Node.js, Deno, and Bun.

**Familiar API**: Works just like `JSON.parse()` and `JSON.stringify()` - if you know JSON, you already know how to use this library!

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

-   🎯 **JSON-like API** - `HLS.parse()` and `HLS.stringify()` mirror the global JSON object
-   🌐 **Universal Compatibility** - Works in browsers, Node.js 16.5+, Deno, and Bun
-   🚀 **Streaming Support** - Parse large playlists efficiently with Web Streams API
-   ✅ **RFC 8216 Compliant** - Full validation with detailed error reporting
-   📦 **Lightweight** - Single dependency (Zod) for schema validation
-   🔄 **Bidirectional** - Parse HLS to objects and stringify objects back to HLS
-   🎯 **TypeScript First** - Full type safety with exported types
-   🧩 **Extensible** - Reviver and replacer functions for custom transformations

## Installation

```bash
npm install streaming-hls-parser
```

## Quick Start

### Parse from String

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
console.log(playlist['#EXT-X-VERSION']); // 3
```

### Parse from Fetch (Browser)

```typescript
import { HLS } from 'streaming-hls-parser';

const response = await fetch('https://example.com/playlist.m3u8');
const text = await response.text();
const playlist = HLS.parse(text);

console.log(playlist.size); // Number of segments
```

### Parse from File Stream (Node.js)

```typescript
import { HLS } from 'streaming-hls-parser';
import { createReadStream } from 'fs';

const stream = createReadStream('playlist.m3u8', { encoding: 'utf-8' });
const playlist = await HLS.parseMediaPlaylist(stream);

console.log('Parsed', playlist.size, 'segments');
```

## API Reference

### HLS Class

The main interface, similar to the global `JSON` object.

#### `HLS.parse(input, reviver?)`

Automatically detect and parse either a Media or Multivariant playlist.

```typescript
const playlist = HLS.parse(hlsString);

// With reviver to transform tokens during parsing
const playlist = HLS.parse(hlsString, (token) => {
    console.log('Parsing:', token.type);
    return token;
});
```

#### `HLS.stringify(playlist, replacer?, options?)`

Convert a playlist back to HLS format.

```typescript
const output = HLS.stringify(playlist);

// With custom line endings
const output = HLS.stringify(playlist, undefined, {
    lineEndings: '\r\n',
});
```

#### `HLS.parseMediaPlaylist(input, reviver?)`

Parse a Media Playlist specifically.

```typescript
// From string
const playlist = HLS.parseMediaPlaylist(hlsString);

// From stream (async)
const stream = createReadStream('playlist.m3u8');
const playlist = await HLS.parseMediaPlaylist(stream);
```

#### `HLS.parseMultivariantPlaylist(input, reviver?)`

Parse a Multivariant (Master) Playlist specifically.

```typescript
const playlist = HLS.parseMultivariantPlaylist(hlsString);
```

#### `HLS.validate(input, reviver?)`

Parse and collect RFC 8216 validation errors.

```typescript
const { playlist, errors } = HLS.validate(hlsString);

if (errors.length > 0) {
    console.log('Validation errors:', errors);
}
```

#### `HLS.isValid(input, reviver?)`

Check if a playlist is valid HLS.

```typescript
if (HLS.isValid(hlsString)) {
    console.log('Valid HLS playlist');
}
```

#### `HLS.tokenize(input)`

Tokenize an HLS string into lexical tokens.

```typescript
const tokens = HLS.tokenize(hlsString);
tokens.forEach((token) => {
    console.log(`${token.type}: ${token.value}`);
});
```

## Data Structures

### MediaPlaylist

Extends `Map<string, MediaSegment>` and represents a Media Playlist.

```typescript
const playlist = HLS.parseMediaPlaylist(input);

// Access tags using full tag names
console.log(playlist['#EXT-X-VERSION']);
console.log(playlist['#EXT-X-TARGETDURATION']);
console.log(playlist['#EXT-X-MEDIA-SEQUENCE']);

// Iterate over segments (Map entries)
playlist.forEach((segment, uri) => {
    console.log(`Segment: ${uri}`);
});

// Get number of segments
console.log(playlist.size);
```

### MultivariantPlaylist

Extends `Map<string, StreamInf>` and represents a Multivariant (Master) Playlist.

```typescript
const playlist = HLS.parseMultivariantPlaylist(input);

// Access tags
console.log(playlist['#EXT-X-VERSION']);

// Iterate over streams
playlist.forEach((stream, uri) => {
    console.log(`Stream: ${uri}, Bandwidth: ${stream.BANDWIDTH}`);
});
```

## Advanced Usage

### Streaming Large Files

For large playlists, use streaming to avoid loading everything into memory:

```typescript
import { HLS } from 'streaming-hls-parser';
import { createReadStream } from 'fs';

const stream = createReadStream('very-large-playlist.m3u8', {
    encoding: 'utf-8',
});

const playlist = await HLS.parseMediaPlaylist(stream);
```

### Custom Token Transformation (Reviver)

Transform tokens during parsing:

```typescript
const playlist = await HLS.parseMediaPlaylist(stream, (token) => {
    if (token.type === '#EXTINF') {
        console.log('Found segment with duration:', token.value);
    }
    return token;
});
```

### Validation with Error Details

```typescript
const { playlist, errors } = HLS.validate(hlsString);

errors.forEach((error) => {
    console.log(`Tag: ${error.tag}`);
    console.log(`Message: ${error.message}`);
    console.log(`Line: ${error.line}`);
});
```

### Value Replacer (Modify Before Encoding)

```typescript
const output = HLS.stringify(playlist, (key, value) => {
    if (key === '#EXT-X-VERSION') {
        return 7; // Upgrade version
    }
    return value;
});
```

### String Replacer (Modify Output Lines)

```typescript
const output = HLS.stringify(playlist, (line) => {
    return line.toUpperCase();
});
```

## Browser Usage

### With Fetch API

```typescript
import { HLS } from 'streaming-hls-parser';

async function loadPlaylist(url) {
    const response = await fetch(url);
    const text = await response.text();
    return HLS.parse(text);
}
```

### With File Input

```typescript
import { HLS } from 'streaming-hls-parser';

async function handleFileUpload(file) {
    const text = await file.text();
    return HLS.parse(text);
}
```

### ES Modules in Browser

```html
<script type="module">
    import { HLS } from './node_modules/streaming-hls-parser/dist/src/index.js';

    const response = await fetch('playlist.m3u8');
    const text = await response.text();
    const playlist = HLS.parse(text);

    console.log('Loaded playlist with', playlist.size, 'segments');
</script>
```

## Platform Support

| Platform    | Version      | Support                       |
| ----------- | ------------ | ----------------------------- |
| Chrome/Edge | 89+          | ✅ Full                       |
| Firefox     | 102+         | ✅ Full                       |
| Safari      | 14.1+        | ✅ Full                       |
| Node.js     | 16.5+        | ✅ Full (Web Streams)         |
| Node.js     | 20+          | ✅ Full (ReadableStream.from) |
| Deno        | All versions | ✅ Full                       |
| Bun         | All versions | ✅ Full                       |

## Examples

See the [examples](./examples) directory for comprehensive usage examples:

-   **[browser-usage.ts](./examples/browser-usage.ts)** - Browser examples with fetch, File API, custom streams
-   **[node-usage.ts](./examples/node-usage.ts)** - Node.js examples with file streams, HTTP, batch processing
-   **[browser-fetch-example.html](./examples/browser-fetch-example.html)** - Live interactive browser demo

## Architecture

### Streaming Pipeline

The parser uses a three-stage Web Streams pipeline:

1. **NewlineTransformer** - Splits input into complete lines
2. **HlsLexicalTransformer** - Tokenizes each line
3. **HlsParseTransformer** - Parses and validates tokens using Zod schemas

This architecture allows for:

-   Memory-efficient parsing of large files
-   Cross-platform compatibility
-   Easy extensibility with reviver functions

## RFC 8216 Compliance

The parser implements RFC 8216 (HTTP Live Streaming) with:

-   ✅ All required tags
-   ✅ All optional tags
-   ✅ Validation rules and constraints
-   ✅ Error collection (lenient parsing)
-   ✅ Both Media and Multivariant playlists

Validation errors are collected rather than thrown, allowing you to:

-   Parse non-compliant playlists
-   Collect all errors at once
-   Decide how to handle violations

## Performance

-   **Streaming**: Processes chunks as they arrive
-   **Zero-copy**: Minimal string allocations
-   **Lenient parsing**: Always validates but collects errors instead of throwing

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Type check
npm run test:typecheck
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass: `npm test`
2. TypeScript compiles: `npm run build`
3. Code follows existing style

## License

ISC

## Related Projects

-   [hls.js](https://github.com/video-dev/hls.js) - HLS player for browsers

## Acknowledgments

-   Built with [Zod](https://github.com/colinhacks/zod) for schema validation
-   Implements [RFC 8216](https://datatracker.ietf.org/doc/html/rfc8216) HTTP Live Streaming specification
