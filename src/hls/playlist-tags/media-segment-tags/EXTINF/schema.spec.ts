import { describe, expect, it } from 'vitest';
import { EXTINF_CODEC } from './schema';

describe('EXTINF schema', () => {
    describe('EXTINF_CODEC decoding', () => {
        it('should decode a valid EXTINF tag with duration only', () => {
            const tag = '#EXTINF:10.5';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: undefined,
            });
        });

        it('should decode a valid EXTINF tag with duration and title', () => {
            const tag = '#EXTINF:10.5,Segment Title';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: 'Segment Title',
            });
        });

        it('should decode a valid EXTINF tag with integer duration', () => {
            const tag = '#EXTINF:10';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10,
                TITLE: undefined,
            });
        });

        it('should decode a valid EXTINF tag with integer duration and title', () => {
            const tag = '#EXTINF:10,Segment Title';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10,
                TITLE: 'Segment Title',
            });
        });

        it('should decode a valid EXTINF tag with zero duration', () => {
            const tag = '#EXTINF:0';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 0,
                TITLE: undefined,
            });
        });

        it('should decode a valid EXTINF tag with zero duration and title', () => {
            const tag = '#EXTINF:0,Zero Duration Segment';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 0,
                TITLE: 'Zero Duration Segment',
            });
        });

        it('should decode a valid EXTINF tag with empty title', () => {
            const tag = '#EXTINF:10.5,';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: undefined,
            });
        });

        it('should decode a valid EXTINF tag with very long duration', () => {
            const tag = '#EXTINF:3600.123456789';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 3600.123456789,
                TITLE: undefined,
            });
        });

        it('should decode a valid EXTINF tag with title containing special characters', () => {
            const tag = '#EXTINF:10.5,Segment with "quotes" and, commas';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: 'Segment with "quotes" and, commas',
            });
        });

        it('should decode a valid EXTINF tag with title containing unicode characters', () => {
            const tag = '#EXTINF:10.5,Segment with émojis 🎬 and ñ characters';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: 'Segment with émojis 🎬 and ñ characters',
            });
        });
    });

    describe('EXTINF_CODEC encoding', () => {
        it('should encode a valid EXTINF object with duration only', () => {
            const input = {
                DURATION: 10.5,
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10.5');
        });

        it('should encode a valid EXTINF object with duration and title', () => {
            const input = {
                DURATION: 10.5,
                TITLE: 'Segment Title',
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10.5,Segment Title');
        });

        it('should encode a valid EXTINF object with integer duration', () => {
            const input = {
                DURATION: 10,
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10');
        });

        it('should encode a valid EXTINF object with integer duration and title', () => {
            const input = {
                DURATION: 10,
                TITLE: 'Segment Title',
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10,Segment Title');
        });

        it('should encode a valid EXTINF object with zero duration', () => {
            const input = {
                DURATION: 0,
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:0');
        });

        it('should encode a valid EXTINF object with zero duration and title', () => {
            const input = {
                DURATION: 0,
                TITLE: 'Zero Duration Segment',
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:0,Zero Duration Segment');
        });

        it('should encode a valid EXTINF object with undefined title', () => {
            const input = {
                DURATION: 10.5,
                TITLE: undefined,
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10.5');
        });

        it('should encode a valid EXTINF object with very long duration', () => {
            const input = {
                DURATION: 3600.123456789,
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:3600.123456789');
        });

        it('should encode a valid EXTINF object with title containing special characters', () => {
            const input = {
                DURATION: 10.5,
                TITLE: 'Segment with "quotes" and, commas',
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10.5,Segment with "quotes" and, commas');
        });

        it('should encode a valid EXTINF object with title containing unicode characters', () => {
            const input = {
                DURATION: 10.5,
                TITLE: 'Segment with émojis 🎬 and ñ characters',
            };
            const result = EXTINF_CODEC.encode(input);
            expect(result).toBe('#EXTINF:10.5,Segment with émojis 🎬 and ñ characters');
        });
    });

    describe('EXTINF_CODEC validation', () => {
        it('should reject negative duration', () => {
            const tag = '#EXTINF:-10.5';
            expect(() => EXTINF_CODEC.decode(tag)).toThrow('DURATION must be non-negative');
        });

        it('should reject invalid duration format', () => {
            const tag = '#EXTINF:invalid';
            expect(() => EXTINF_CODEC.decode(tag)).toThrow();
        });

        it('should reject empty duration', () => {
            const tag = '#EXTINF:';
            expect(() => EXTINF_CODEC.decode(tag)).toThrow();
        });

        it('should reject missing duration', () => {
            const tag = '#EXTINF:,Title Only';
            expect(() => EXTINF_CODEC.decode(tag)).toThrow();
        });

        it('should reject non-numeric duration', () => {
            const tag = '#EXTINF:abc,Title';
            expect(() => EXTINF_CODEC.decode(tag)).toThrow();
        });

        it('should accept valid duration formats', () => {
            const validDurations = ['0', '10', '10.5', '3600.123456789', '0.001'];

            validDurations.forEach((duration) => {
                const tag = `#EXTINF:${duration}` as const;
                expect(() => EXTINF_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid duration formats with titles', () => {
            const validDurations = ['0', '10', '10.5', '3600.123456789', '0.001'];

            validDurations.forEach((duration) => {
                const tag = `#EXTINF:${duration},Test Title` as const;
                expect(() => EXTINF_CODEC.decode(tag)).not.toThrow();
            });
        });
    });

    describe('EXTINF_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle with duration only', () => {
            const original = {
                DURATION: 10.5,
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with duration and title', () => {
            const original = {
                DURATION: 10.5,
                TITLE: 'Segment Title',
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with integer duration', () => {
            const original = {
                DURATION: 10,
                TITLE: 'Integer Duration Segment',
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with zero duration', () => {
            const original = {
                DURATION: 0,
                TITLE: 'Zero Duration Segment',
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with very long duration', () => {
            const original = {
                DURATION: 3600.123456789,
                TITLE: 'Long Duration Segment',
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with special characters in title', () => {
            const original = {
                DURATION: 10.5,
                TITLE: 'Segment with "quotes" and, commas',
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with unicode characters in title', () => {
            const original = {
                DURATION: 10.5,
                TITLE: 'Segment with émojis 🎬 and ñ characters',
            };

            const encoded = EXTINF_CODEC.encode(original);
            const decoded = EXTINF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should produce consistent encoding', () => {
            const input = {
                DURATION: 10.5,
                TITLE: 'Test Segment',
            };
            const encoded1 = EXTINF_CODEC.encode(input);
            const encoded2 = EXTINF_CODEC.encode(input);

            expect(encoded1).toBe(encoded2);
            expect(encoded1).toBe('#EXTINF:10.5,Test Segment');
        });

        it('should produce consistent decoding', () => {
            const tag = '#EXTINF:10.5,Test Segment';
            const decoded1 = EXTINF_CODEC.decode(tag);
            const decoded2 = EXTINF_CODEC.decode(tag);

            expect(decoded1).toMatchObject(decoded2);
            expect(decoded1).toMatchObject({
                DURATION: 10.5,
                TITLE: 'Test Segment',
            });
        });
    });

    describe('EXTINF_CODEC edge cases', () => {
        it('should handle very small positive duration', () => {
            const tag = '#EXTINF:0.001';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 0.001,
                TITLE: undefined,
            });
        });

        it('should handle very large duration', () => {
            const tag = '#EXTINF:86400';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 86400,
                TITLE: undefined,
            });
        });

        it('should handle title with only whitespace', () => {
            const tag = '#EXTINF:10.5,   ';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: '   ',
            });
        });

        it('should handle title with newlines', () => {
            const tag = '#EXTINF:10.5,Title with\nnewline';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: 'Title with\nnewline',
            });
        });

        it('should handle title with tabs', () => {
            const tag = '#EXTINF:10.5,Title\twith\ttabs';
            const result = EXTINF_CODEC.decode(tag);
            expect(result).toMatchObject({
                DURATION: 10.5,
                TITLE: 'Title\twith\ttabs',
            });
        });
    });
});
