import { describe, it, expect } from 'vitest';
import {
    HLS,
    MediaPlaylist,
    MultivariantPlaylist,
    isValueReplacer,
    isStringReplacer,
} from './index';

describe('HLS Class - JSON-like API', () => {
    describe('parse() method', () => {
        it('should parse a Media Playlist', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = HLS.parse(input);
            expect(playlist).toBeInstanceOf(MediaPlaylist);
        });

        it('should parse a Multivariant Playlist', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000
http://example.com/low.m3u8`;

            const playlist = HLS.parse(input);
            expect(playlist).toBeInstanceOf(MultivariantPlaylist);
        });

        it('should throw error for invalid playlist', () => {
            expect(() => HLS.parse('invalid')).toThrow();
        });

        it('should accept reviver parameter', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            let reviverCalled = false;
            const playlist = HLS.parse(input, (token) => {
                reviverCalled = true;
                return token;
            });

            expect(reviverCalled).toBe(true);
            expect(playlist).toBeInstanceOf(MediaPlaylist);
        });
    });

    describe('stringify() method', () => {
        it('should stringify a MediaPlaylist', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);
            const output = HLS.stringify(playlist);
            expect(output).toContain('#EXTM3U');
            expect(output).toContain('#EXT-X-VERSION:3');
            expect(output).toContain('#EXT-X-TARGETDURATION:10');
        });

        it('should stringify a MultivariantPlaylist', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000
http://example.com/low.m3u8`;

            const playlist = MultivariantPlaylist.fromString(input);
            const output = HLS.stringify(playlist);
            expect(output).toContain('#EXTM3U');
            expect(output).toContain('#EXT-X-STREAM-INF');
        });

        it('should throw error for invalid input', () => {
            expect(() => HLS.stringify({} as any)).toThrow();
        });
    });

    describe('Value-level Replacer', () => {
        it('should apply value-level replacer to MediaPlaylist', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);

            // Replace version value
            const output = playlist.toHLS((key, value) => {
                if (key === '#EXT-X-VERSION') {
                    return 7; // Upgrade version
                }
                return value;
            });

            expect(output).toContain('#EXT-X-VERSION:7');
            expect(output).not.toContain('#EXT-X-VERSION:3');
        });

        it('should omit properties when replacer returns undefined', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);

            // Remove version tag
            const output = playlist.toHLS((key, value) => {
                if (key === '#EXT-X-VERSION') {
                    return undefined; // Omit this property
                }
                return value;
            });

            expect(output).not.toContain('#EXT-X-VERSION');
            expect(output).toContain('#EXTM3U');
        });

        it('should be identified by isValueReplacer', () => {
            const valueReplacer = (_key: string, value: any) => value;
            expect(isValueReplacer(valueReplacer)).toBe(true);
        });
    });

    describe('String-level Replacer', () => {
        it('should apply string-level replacer to output lines', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);

            // Add comments to each line
            const output = playlist.toHLS((line: string) => {
                if (line.startsWith('#EXT')) {
                    return `${line} # Added comment`;
                }
                return line;
            });

            expect(output).toContain('#EXT-X-VERSION:3 # Added comment');
            expect(output).toContain('#EXTM3U # Added comment');
        });

        it('should be identified by isStringReplacer', () => {
            const stringReplacer = (line: string) => line;
            expect(isStringReplacer(stringReplacer)).toBe(true);
        });
    });

    describe('FormatOptions', () => {
        it('should use custom line endings', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);
            const output = playlist.toHLS(undefined, { lineEndings: '\r\n' });

            expect(output).toContain('\r\n');
            expect(output.split('\r\n').length).toBeGreaterThan(1);
        });

        it('should default to \\n line endings', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);
            const output = playlist.toHLS();

            expect(output).toContain('\n');
            expect(output).not.toContain('\r\n');
        });

        it('should work with both replacer and options', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const playlist = MediaPlaylist.fromString(input);
            const output = playlist.toHLS(
                (line: string) => line.toUpperCase(),
                { lineEndings: '\r\n' },
            );

            expect(output).toContain('\r\n');
            expect(output).toContain('#EXTM3U');
            // String replacer converts to uppercase
            expect(output).toContain('#EXT-X-VERSION:3');
        });
    });

    describe('Extended Methods', () => {
        describe('parseMediaPlaylist()', () => {
            it('should parse Media Playlist from string', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const playlist = HLS.parseMediaPlaylist(input);
                expect(playlist).toBeInstanceOf(MediaPlaylist);
            });
        });

        describe('parseMultivariantPlaylist()', () => {
            it('should parse Multivariant Playlist from string', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1280000
http://example.com/low.m3u8`;

                const playlist = HLS.parseMultivariantPlaylist(input);
                expect(playlist).toBeInstanceOf(MultivariantPlaylist);
            });
        });

        describe('tokenize()', () => {
            it('should tokenize HLS playlist', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10`;

                const tokens = HLS.tokenize(input);
                expect(tokens).toBeInstanceOf(Array);
                expect(tokens.length).toBe(3);
                expect(tokens[0].type).toBe('#EXTM3U');
                expect(tokens[1].type).toBe('#EXT-X-VERSION');
                expect(tokens[2].type).toBe('#EXT-X-TARGETDURATION');
            });

            it('should include token values', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3`;

                const tokens = HLS.tokenize(input);
                expect(tokens[1].value).toBe(3);
            });
        });

        describe('isValid()', () => {
            it('should validate correct Media Playlist', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                expect(HLS.isValid(input)).toBe(true);
            });

            it('should validate correct Multivariant Playlist', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1280000
http://example.com/low.m3u8`;

                expect(HLS.isValid(input)).toBe(true);
            });

            it('should reject playlist without #EXTM3U', () => {
                const input = `#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10`;

                expect(HLS.isValid(input)).toBe(false);
            });

            it('should reject invalid input', () => {
                expect(HLS.isValid('random text')).toBe(false);
            });
        });

        describe('getTags()', () => {
            it('should return all tag names', () => {
                const tags = HLS.getTags();
                expect(tags).toBeInstanceOf(Array);
                expect(tags.length).toBeGreaterThan(0);
                expect(tags).toContain('#EXTM3U');
                expect(tags).toContain('#EXT-X-VERSION');
            });
        });

        describe('getTagSchema()', () => {
            it('should return schema for specific tag', () => {
                const schema = HLS.getTagSchema('#EXT-X-VERSION');
                expect(schema).toBeDefined();
                expect(schema).toHaveProperty('decode');
                expect(schema).toHaveProperty('encode');
            });

            it('should return undefined for unknown tag', () => {
                const schema = HLS.getTagSchema('#UNKNOWN-TAG');
                expect(schema).toBeUndefined();
            });
        });
    });

    describe('Reviver integration', () => {
        it('should apply reviver in MediaPlaylist.fromString', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

            const reviverCalls: string[] = [];
            const playlist = MediaPlaylist.fromString(input, (token) => {
                reviverCalls.push(token.type);
                return token;
            });

            expect(playlist).toBeInstanceOf(MediaPlaylist);
            expect(reviverCalls).toContain('#EXTM3U');
            expect(reviverCalls).toContain('#EXT-X-VERSION');
        });

        it('should apply reviver in MultivariantPlaylist.fromString', () => {
            const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1280000
http://example.com/low.m3u8`;

            const reviverCalls: string[] = [];
            const playlist = MultivariantPlaylist.fromString(input, (token) => {
                reviverCalls.push(token.type);
                return token;
            });

            expect(playlist).toBeInstanceOf(MultivariantPlaylist);
            expect(reviverCalls).toContain('#EXTM3U');
            expect(reviverCalls).toContain('#EXT-X-STREAM-INF');
        });
    });

    describe('Validation and Error Collection', () => {
        describe('validate() method', () => {
            it('should return playlist with empty errors for valid input', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const { playlist, errors } = HLS.validate(input);
                expect(playlist).toBeInstanceOf(MediaPlaylist);
                expect(errors).toEqual([]);
            });

            it('should collect validation errors from EXT-X-DATERANGE tags', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const { playlist, errors } = HLS.validate(input);
                expect(playlist).toBeInstanceOf(MediaPlaylist);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].tag).toBe('#EXT-X-DATERANGE');
                expect(errors[0].message).toContain('END-DATE must be equal to or later than START-DATE');
                expect(errors[0].index).toBe(0); // First segment
            });

            it('should collect multiple validation errors from multiple segments', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-DATERANGE:ID="2",CLASS="ad",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES",DURATION=10
#EXTINF:9.009,
http://media.example.com/second.ts
#EXT-X-ENDLIST`;

                const { playlist, errors } = HLS.validate(input);
                expect(playlist).toBeInstanceOf(MediaPlaylist);
                expect(errors.length).toBeGreaterThanOrEqual(2);

                // First segment error - CLASS required
                const firstSegmentErrors = errors.filter(e => e.index === 0);
                expect(firstSegmentErrors.some(e => e.message.includes('CLASS attribute is REQUIRED'))).toBe(true);

                // Second segment error - DURATION not allowed
                const secondSegmentErrors = errors.filter(e => e.index === 1);
                expect(secondSegmentErrors.some(e => e.message.includes('DURATION and END-DATE attributes MUST NOT be present'))).toBe(true);
            });

            it('should include line source in error details', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const { errors } = HLS.validate(input);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].line).toBeDefined();
                expect(errors[0].line).toContain('#EXT-X-DATERANGE');
            });
        });

        describe('hasErrors() method', () => {
            it('should return false for valid playlist', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                expect(HLS.hasErrors(input)).toBe(false);
            });

            it('should return true for playlist with validation errors', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                expect(HLS.hasErrors(input)).toBe(true);
            });

            it('should work with parsed playlist instances', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const playlist = HLS.parse(input);
                expect(HLS.hasErrors(playlist)).toBe(true);
            });
        });

        describe('getErrors() method', () => {
            it('should return empty array for valid playlist', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const errors = HLS.getErrors(input);
                expect(errors).toEqual([]);
            });

            it('should return validation errors', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const errors = HLS.getErrors(input);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].tag).toBe('#EXT-X-DATERANGE');
            });

            it('should work with parsed playlist instances', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const playlist = HLS.parse(input);
                const errors = HLS.getErrors(playlist);
                expect(errors.length).toBeGreaterThan(0);
            });
        });

        describe('Lenient Parsing - errors do not prevent parsing', () => {
            it('should parse playlist even with validation errors', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const playlist = HLS.parse(input);
                expect(playlist).toBeInstanceOf(MediaPlaylist);
                expect(playlist.size).toBe(1); // Segment is still parsed
                expect(playlist.errors.length).toBeGreaterThan(0);
            });

            it('should allow stringifying playlist with errors', () => {
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"
#EXTINF:9.009,
http://media.example.com/first.ts
#EXT-X-ENDLIST`;

                const playlist = HLS.parse(input);
                const output = HLS.stringify(playlist);
                expect(output).toContain('#EXTM3U');
                // Note: Invalid tag data is not included in output (lenient parsing doesn't include invalid values)
                // but the segment itself is still created
                expect(output).toContain('http://media.example.com/first.ts');
            });
        });

        describe('MultivariantPlaylist error collection', () => {
            it('should collect errors from variant streams', () => {
                // Note: Currently EXT-X-STREAM-INF doesn't have validation rules that fail,
                // but the infrastructure is in place. This test demonstrates the structure.
                const input = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1280000
http://example.com/low.m3u8`;

                const playlist = HLS.parse(input);
                expect(playlist).toBeInstanceOf(MultivariantPlaylist);
                expect(playlist.errors).toEqual([]); // No errors for this valid playlist
            });
        });
    });
});
