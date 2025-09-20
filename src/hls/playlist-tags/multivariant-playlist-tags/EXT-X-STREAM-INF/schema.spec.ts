import { describe, expect, it } from 'vitest';
import { EXT_X_STREAM_INF_CODEC } from './schema';

describe('EXT-X-STREAM-INF schema', () => {
    describe('EXT_X_STREAM_INF_CODEC decoding', () => {
        it('should decode a valid EXT-X-STREAM-INF tag with minimal attributes', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
            });
        });

        it('should decode a valid EXT-X-STREAM-INF tag with all attributes', () => {
            const tag =
                '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,CODECS="mp4a.40.2,avc1.4d401e",RESOLUTION=1920x1080,FRAME-RATE=29.97,HDCP-LEVEL=TYPE-0,AUDIO="audio-group",VIDEO="video-group"';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
                'AVERAGE-BANDWIDTH': 1000000,
                CODECS: ['mp4a.40.2', 'avc1.4d401e'],
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
                'FRAME-RATE': 29.97,
                'HDCP-LEVEL': 'TYPE-0',
                AUDIO: 'audio-group',
                VIDEO: 'video-group',
            });
        });

        it('should decode with CODECS array', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="mp4a.40.2,avc1.4d401e,ac-3"';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
                CODECS: ['mp4a.40.2', 'avc1.4d401e', 'ac-3'],
            });
        });

        it('should decode with RESOLUTION object', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=1920x1080';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
            });
        });

        it('should decode with HDCP-LEVEL NONE', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,HDCP-LEVEL=NONE';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
                'HDCP-LEVEL': 'NONE',
            });
        });

        it('should decode with FRAME-RATE', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,FRAME-RATE=60.0';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
                'FRAME-RATE': 60.0,
            });
        });

        it('should decode with AVERAGE-BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000';
            const result = EXT_X_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                BANDWIDTH: 1280000,
                'AVERAGE-BANDWIDTH': 1000000,
            });
        });
    });

    describe('EXT_X_STREAM_INF_CODEC encoding', () => {
        it('should encode a valid EXT-X-STREAM-INF tag with minimal attributes', () => {
            const input = {
                BANDWIDTH: 1280000,
            };
            const result = EXT_X_STREAM_INF_CODEC.encode(input);
            expect(result).toBe('#EXT-X-STREAM-INF:BANDWIDTH=1280000');
        });

        it('should encode a valid EXT-X-STREAM-INF tag with all attributes', () => {
            const input = {
                BANDWIDTH: 1280000,
                'AVERAGE-BANDWIDTH': 1000000,
                CODECS: ['mp4a.40.2', 'avc1.4d401e'],
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
                'FRAME-RATE': 29.97,
                'HDCP-LEVEL': 'TYPE-0' as const,
                AUDIO: 'audio-group',
                VIDEO: 'video-group',
            };
            const result = EXT_X_STREAM_INF_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,CODECS="mp4a.40.2,avc1.4d401e",RESOLUTION=1920x1080,FRAME-RATE=29.97,HDCP-LEVEL=TYPE-0,AUDIO="audio-group",VIDEO="video-group"',
            );
        });

        it('should encode with CODECS array', () => {
            const input = {
                BANDWIDTH: 1280000,
                CODECS: ['mp4a.40.2', 'avc1.4d401e', 'ac-3'],
            };
            const result = EXT_X_STREAM_INF_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="mp4a.40.2,avc1.4d401e,ac-3"',
            );
        });

        it('should encode with RESOLUTION object', () => {
            const input = {
                BANDWIDTH: 1280000,
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
            };
            const result = EXT_X_STREAM_INF_CODEC.encode(input);
            expect(result).toBe('#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=1920x1080');
        });

        it('should encode with HDCP-LEVEL NONE', () => {
            const input = {
                BANDWIDTH: 1280000,
                'HDCP-LEVEL': 'NONE' as const,
            };
            const result = EXT_X_STREAM_INF_CODEC.encode(input);
            expect(result).toBe('#EXT-X-STREAM-INF:BANDWIDTH=1280000,HDCP-LEVEL=NONE');
        });

        it('should encode with FRAME-RATE', () => {
            const input = {
                BANDWIDTH: 1280000,
                'FRAME-RATE': 60.0,
            };
            const result = EXT_X_STREAM_INF_CODEC.encode(input);
            expect(result).toBe('#EXT-X-STREAM-INF:BANDWIDTH=1280000,FRAME-RATE=60');
        });
    });

    describe('EXT_X_STREAM_INF_CODEC validation', () => {
        it('should reject missing BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:CODECS="mp4a.40.2"';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow();
        });

        it('should reject negative BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=-1000';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow(
                'BANDWIDTH must be a non-negative integer',
            );
        });

        it('should reject non-integer BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000.5';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow();
        });

        it('should reject negative AVERAGE-BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=-1000';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow(
                'AVERAGE-BANDWIDTH must be a non-negative integer',
            );
        });

        it('should reject AVERAGE-BANDWIDTH exceeding BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=2000000';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow(
                'AVERAGE-BANDWIDTH must not exceed BANDWIDTH',
            );
        });

        it('should reject invalid HDCP-LEVEL', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,HDCP-LEVEL=INVALID';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow();
        });

        it('should reject negative FRAME-RATE', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,FRAME-RATE=-1.0';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow(
                'FRAME-RATE must be non-negative',
            );
        });

        it('should reject invalid RESOLUTION format', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=invalid';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow();
        });

        it('should reject RESOLUTION with zero dimensions', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=0x1080';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow();
        });

        it('should accept valid HDCP-LEVEL values', () => {
            const validLevels = ['TYPE-0', 'NONE'];

            validLevels.forEach((level) => {
                const tag = `#EXT-X-STREAM-INF:BANDWIDTH=1280000,HDCP-LEVEL=${level}`;
                expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid RESOLUTION formats', () => {
            const validResolutions = ['1920x1080', '1280x720', '3840x2160', '640x480'];

            validResolutions.forEach((resolution) => {
                const tag = `#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=${resolution}`;
                expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid FRAME-RATE values', () => {
            const validFrameRates = ['24.0', '25.0', '29.97', '30.0', '50.0', '59.94', '60.0'];

            validFrameRates.forEach((frameRate) => {
                const tag = `#EXT-X-STREAM-INF:BANDWIDTH=1280000,FRAME-RATE=${frameRate}`;
                expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid CODECS formats', () => {
            const validCodecs = [
                '"mp4a.40.2"',
                '"avc1.4d401e"',
                '"mp4a.40.2,avc1.4d401e"',
                '"ac-3"',
                '"mp4a.40.2,avc1.4d401e,ac-3"',
            ];

            validCodecs.forEach((codecs) => {
                const tag = `#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS=${codecs}`;
                expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).not.toThrow();
            });
        });
    });

    describe('EXT_X_STREAM_INF_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle with minimal attributes', () => {
            const original = {
                BANDWIDTH: 1280000,
            };

            const encoded = EXT_X_STREAM_INF_CODEC.encode(original);
            const decoded = EXT_X_STREAM_INF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with all attributes', () => {
            const original = {
                BANDWIDTH: 1280000,
                'AVERAGE-BANDWIDTH': 1000000,
                CODECS: ['mp4a.40.2', 'avc1.4d401e'],
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
                'FRAME-RATE': 29.97,
                'HDCP-LEVEL': 'TYPE-0' as const,
                AUDIO: 'audio-group',
                VIDEO: 'video-group',
            };

            const encoded = EXT_X_STREAM_INF_CODEC.encode(original);
            const decoded = EXT_X_STREAM_INF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with complex CODECS', () => {
            const original = {
                BANDWIDTH: 1280000,
                CODECS: ['mp4a.40.2', 'avc1.4d401e', 'ac-3', 'ec-3'],
            };

            const encoded = EXT_X_STREAM_INF_CODEC.encode(original);
            const decoded = EXT_X_STREAM_INF_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });
    });

    describe('EXT_X_STREAM_INF_CODEC business logic validation', () => {
        it('should enforce BANDWIDTH is required', () => {
            const tag = '#EXT-X-STREAM-INF:CODECS="mp4a.40.2"';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow();
        });

        it('should enforce AVERAGE-BANDWIDTH does not exceed BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1000000,AVERAGE-BANDWIDTH=1500000';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).toThrow(
                'AVERAGE-BANDWIDTH must not exceed BANDWIDTH',
            );
        });

        it('should allow AVERAGE-BANDWIDTH equal to BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1280000';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).not.toThrow();
        });

        it('should allow AVERAGE-BANDWIDTH less than BANDWIDTH', () => {
            const tag = '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000';
            expect(() => EXT_X_STREAM_INF_CODEC.decode(tag)).not.toThrow();
        });
    });
});
