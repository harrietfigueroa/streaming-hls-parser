import { MediaPlaylist } from './hls/playlists/media-playlist';
import { MultivariantPlaylist } from './hls/playlists/multivariant-playlist';
import { Reviver, LexicalToken } from './parser/parser.interfaces';
import { Replacer, FormatOptions } from './hls/hlsifier/hlsifier.interfaces';
import { tokenizeLine } from './parser/tokenize-line';
import { parseTokenizedLine } from './parser/parse-tokenized-line';
import { playlistTagRegistry } from './hls/playlist-tags/playlist-tag.registry';

/**
 * Static HLS utility class that provides a JSON-like API for parsing and stringifying
 * HLS playlists. Mimics the global JSON object's interface while adding HLS-specific features.
 */
export class HLS {
    // ============ Core JSON-like API ============

    /**
     * Automatically detect and parse either a Media or Multivariant playlist.
     * Similar to JSON.parse() but for HLS playlists.
     *
     * @param input - HLS playlist string
     * @param reviver - Optional function to transform parsed tokens
     * @returns Parsed playlist instance
     * @throws Error if playlist type cannot be determined
     *
     * @example
     * ```typescript
     * // Parse any HLS playlist
     * const playlist = HLS.parse(hlsString);
     *
     * // With reviver to transform tokens
     * const playlist = HLS.parse(hlsString, (token) => {
     *   console.log('Parsing:', token.type);
     *   return token;
     * });
     * ```
     */
    public static parse(
        input: string,
        reviver?: Reviver,
    ): MediaPlaylist | MultivariantPlaylist {
        if (typeof input === 'string') {
            if (MediaPlaylist.isMediaPlaylist(input)) {
                return MediaPlaylist.fromString(input, reviver);
            } else if (MultivariantPlaylist.isMultivariantPlaylist(input)) {
                return MultivariantPlaylist.fromString(input, reviver);
            }
        }
        throw new Error(`Unable to determine playlist type from input`);
    }

    /**
     * Convert a playlist instance back to HLS string format.
     * Similar to JSON.stringify() but for HLS playlists.
     *
     * @param playlist - Playlist instance to serialize
     * @param replacer - Optional function to transform values or output lines
     *   - ValueReplacer (2 params): transforms property values before encoding
     *   - StringReplacer (1 param): transforms output lines after encoding
     * @param options - Optional formatting options
     * @returns HLS playlist string
     *
     * @example
     * ```typescript
     * // Basic stringification
     * const output = HLS.stringify(playlist);
     *
     * // With value-level replacer (like JSON.stringify)
     * const output = HLS.stringify(playlist, (key, value) => {
     *   if (key === '#EXT-X-VERSION') return 7; // Upgrade version
     *   return value;
     * });
     *
     * // With string-level replacer
     * const output = HLS.stringify(playlist, (line) => {
     *   return line.toUpperCase();
     * });
     *
     * // With formatting options
     * const output = HLS.stringify(playlist, undefined, {
     *   lineEndings: '\r\n'
     * });
     * ```
     */
    public static stringify(
        playlist: MediaPlaylist | MultivariantPlaylist,
        replacer?: Replacer,
        options?: FormatOptions,
    ): string {
        if (playlist instanceof MediaPlaylist) {
            return playlist.toHLS(replacer, options);
        }
        if (playlist instanceof MultivariantPlaylist) {
            return playlist.toHLS(replacer, options);
        }

        throw new Error(`Invalid playlist type: ${playlist}`);
    }

    // ============ Extended Convenience Methods ============

    /**
     * Parse a Media Playlist specifically.
     * Useful when you know the playlist type in advance.
     *
     * @param input - HLS Media Playlist string or async iterable
     * @param reviver - Optional function to transform parsed tokens
     * @returns MediaPlaylist instance or Promise<MediaPlaylist>
     *
     * @example
     * ```typescript
     * // Parse from string
     * const playlist = HLS.parseMediaPlaylist(hlsString);
     *
     * // Parse from stream
     * const playlist = await HLS.parseMediaPlaylist(asyncIterable);
     * ```
     */
    public static parseMediaPlaylist(input: string, reviver?: Reviver): MediaPlaylist;
    public static parseMediaPlaylist(
        input: AsyncIterable<string>,
        reviver?: Reviver,
    ): Promise<MediaPlaylist>;
    public static parseMediaPlaylist(
        input: string | AsyncIterable<string>,
        reviver?: Reviver,
    ): MediaPlaylist | Promise<MediaPlaylist> {
        if (typeof input === 'string') {
            return MediaPlaylist.fromString(input, reviver);
        }
        return MediaPlaylist.fromStream(input, reviver);
    }

    /**
     * Parse a Multivariant Playlist specifically.
     * Useful when you know the playlist type in advance.
     *
     * @param input - HLS Multivariant Playlist string or async iterable
     * @param reviver - Optional function to transform parsed tokens
     * @returns MultivariantPlaylist instance or Promise<MultivariantPlaylist>
     *
     * @example
     * ```typescript
     * // Parse from string
     * const playlist = HLS.parseMultivariantPlaylist(hlsString);
     *
     * // Parse from stream
     * const playlist = await HLS.parseMultivariantPlaylist(asyncIterable);
     * ```
     */
    public static parseMultivariantPlaylist(
        input: string,
        reviver?: Reviver,
    ): MultivariantPlaylist;
    public static parseMultivariantPlaylist(
        input: AsyncIterable<string>,
        reviver?: Reviver,
    ): Promise<MultivariantPlaylist>;
    public static parseMultivariantPlaylist(
        input: string | AsyncIterable<string>,
        reviver?: Reviver,
    ): MultivariantPlaylist | Promise<MultivariantPlaylist> {
        if (typeof input === 'string') {
            return MultivariantPlaylist.fromString(input, reviver);
        }
        return MultivariantPlaylist.fromStream(input, reviver);
    }

    /**
     * Tokenize an HLS playlist string into an array of lexical tokens.
     * Useful for custom parsing logic or analysis.
     *
     * @param input - HLS playlist string
     * @returns Array of lexical tokens
     *
     * @example
     * ```typescript
     * const tokens = HLS.tokenize(hlsString);
     * tokens.forEach(token => {
     *   console.log(`${token.type}: ${token.value}`);
     * });
     * ```
     */
    public static tokenize(input: string): LexicalToken[] {
        const tokens: LexicalToken[] = [];
        for (const line of input.split('\n')) {
            const tokenized = tokenizeLine(line);
            const parsed = parseTokenizedLine(tokenized);
            tokens.push(parsed);
        }
        return tokens;
    }

    /**
     * Validate an HLS playlist string without fully parsing it.
     * Checks basic structure and required tags.
     *
     * @param input - HLS playlist string
     * @returns true if the input appears to be valid HLS, false otherwise
     *
     * @example
     * ```typescript
     * if (HLS.isValid(hlsString)) {
     *   const playlist = HLS.parse(hlsString);
     * } else {
     *   console.error('Invalid HLS playlist');
     * }
     * ```
     */
    public static isValid(input: string): boolean {
        try {
            // Check for required #EXTM3U header
            if (!input.trim().startsWith('#EXTM3U')) {
                return false;
            }

            // Try to determine playlist type
            if (MediaPlaylist.isMediaPlaylist(input) || MultivariantPlaylist.isMultivariantPlaylist(input)) {
                // Attempt to parse
                HLS.parse(input);
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }

    /**
     * Parse an HLS playlist and collect any RFC 8216 validation errors.
     * Unlike parse(), this will not throw on validation errors - instead,
     * errors are collected and returned alongside the parsed playlist.
     *
     * @param input - HLS playlist string
     * @param reviver - Optional function to transform parsed tokens
     * @returns Object containing the playlist and any validation errors
     *
     * @example
     * ```typescript
     * const { playlist, errors } = HLS.validate(hlsString);
     *
     * if (errors.length > 0) {
     *   console.log('Found validation errors:');
     *   errors.forEach(err => {
     *     console.log(`  ${err.tag}: ${err.message}`);
     *   });
     * }
     *
     * // Playlist is still usable even with errors
     * console.log(playlist.toHLS());
     * ```
     */
    public static validate(
        input: string,
        reviver?: Reviver,
    ): {
        playlist: MediaPlaylist | MultivariantPlaylist;
        errors: Array<{
            tag: string;
            path?: (string | number)[];
            message: string;
            code?: string;
            line?: string;
            index?: number;
        }>;
    } {
        const playlist = HLS.parse(input, reviver);
        return {
            playlist,
            errors: playlist.errors,
        };
    }

    /**
     * Check if a playlist has any RFC 8216 validation errors without examining the errors themselves.
     * This is a convenience method that parses the playlist and checks the errors array.
     *
     * @param input - HLS playlist string or parsed playlist instance
     * @param reviver - Optional function to transform parsed tokens (only used if input is string)
     * @returns true if the playlist has validation errors, false otherwise
     *
     * @example
     * ```typescript
     * if (HLS.hasErrors(hlsString)) {
     *   console.log('This playlist has RFC 8216 violations');
     * }
     * ```
     */
    public static hasErrors(
        input: string | MediaPlaylist | MultivariantPlaylist,
        reviver?: Reviver,
    ): boolean {
        const playlist = typeof input === 'string' ? HLS.parse(input, reviver) : input;
        return playlist.errors.length > 0;
    }

    /**
     * Get all validation errors from a playlist.
     * This is a convenience method that parses the playlist and returns its errors array.
     *
     * @param input - HLS playlist string or parsed playlist instance
     * @param reviver - Optional function to transform parsed tokens (only used if input is string)
     * @returns Array of validation errors
     *
     * @example
     * ```typescript
     * const errors = HLS.getErrors(hlsString);
     * errors.forEach(err => {
     *   console.log(`${err.tag} at segment ${err.index}: ${err.message}`);
     * });
     * ```
     */
    public static getErrors(
        input: string | MediaPlaylist | MultivariantPlaylist,
        reviver?: Reviver,
    ): Array<{
        tag: string;
        path?: (string | number)[];
        message: string;
        code?: string;
        line?: string;
        index?: number;
    }> {
        const playlist = typeof input === 'string' ? HLS.parse(input, reviver) : input;
        return playlist.errors;
    }

    // ============ Schema Introspection Methods ============

    /**
     * Get all available HLS tag names in the registry.
     * Useful for introspection and validation.
     *
     * @returns Array of tag names (e.g., ['#EXTM3U', '#EXT-X-VERSION', ...])
     *
     * @example
     * ```typescript
     * const tags = HLS.getTags();
     * console.log(`Found ${tags.length} tag types`);
     * ```
     */
    public static getTags(): string[] {
        return Object.keys(playlistTagRegistry);
    }

    /**
     * Get the Zod codec schema for a specific tag.
     * Useful for custom validation and parsing.
     *
     * @param tagName - The tag name (e.g., '#EXT-X-VERSION')
     * @returns The Zod codec for the tag, or undefined if not found
     *
     * @example
     * ```typescript
     * const schema = HLS.getTagSchema('#EXT-X-VERSION');
     * if (schema) {
     *   const decoded = schema.decode('#EXT-X-VERSION:3');
     * }
     * ```
     */
    public static getTagSchema(tagName: string): (typeof playlistTagRegistry)[keyof typeof playlistTagRegistry] | undefined {
        return playlistTagRegistry[tagName as keyof typeof playlistTagRegistry];
    }

}

// ============ Re-export Types and Utilities ============

// Playlist classes
export { MediaPlaylist } from './hls/playlists/media-playlist';
export { MultivariantPlaylist } from './hls/playlists/multivariant-playlist';
export type { Playlist, ValidationError } from './hls/playlists/playlists.interfaces';

// Replacer types and utilities
export type {
    Replacer,
    ValueReplacer,
    StringReplacer,
    FormatOptions,
} from './hls/hlsifier/hlsifier.interfaces';
export { isValueReplacer, isStringReplacer } from './hls/hlsifier/hlsifier.interfaces';

// Reviver types and parser utilities
export type { Reviver, LexicalToken } from './parser/parser.interfaces';
export { tokenizeLine } from './parser/tokenize-line';
export { parseTokenizedLine } from './parser/parse-tokenized-line';

// Tag registry for advanced users
export { playlistTagRegistry } from './hls/playlist-tags/playlist-tag.registry';
