/**
 * Validation error from a tag or attribute
 */
export interface ValidationError {
    /** Tag name (e.g., '#EXT-X-DATERANGE', '#EXT-X-STREAM-INF') */
    tag: string;
    /** Path to the problematic field within the tag */
    path?: (string | number)[];
    /** Human-readable error message */
    message: string;
    /** Error code from Zod validation */
    code?: string;
    /** Original line that caused the error */
    line?: string;
    /** Index of the segment or stream that contains the error */
    index?: number;
}

/**
 * Base interface for playlists
 */
export interface Playlist {
    /**
     * Collection of RFC 8216 validation errors found during parsing.
     * Empty array means no violations detected.
     *
     * Errors from child objects (segments, streams) are automatically
     * collected and included in this array.
     *
     * @example
     * ```typescript
     * const playlist = MediaPlaylist.fromString(hlsString);
     *
     * if (playlist.errors.length > 0) {
     *   console.log('RFC violations:');
     *   playlist.errors.forEach(err => {
     *     console.log(`  ${err.tag}: ${err.message}`);
     *   });
     * }
     * ```
     */
    readonly errors: ValidationError[];

    toHLS(): string;
    toJSON(): unknown;
}
