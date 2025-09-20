import { describe, it, expect } from 'vitest';
import { EXT_X_I_FRAME_STREAM_INF_CODEC } from './schema';

describe('EXT_X_I_FRAME_STREAM_INF_CODEC', () => {
    describe('EXT_X_I_FRAME_STREAM_INF_CODEC decoding', () => {
        it('should decode a valid EXT_X_I_FRAME_STREAM_INF tag', () => {
            const tag =
                '#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,CODECS="mp4a.40.5",RESOLUTION=1920x1080,HDCP-LEVEL=TYPE-0,VIDEO="video"\nhttps://example.com/iframe.m3u8';
            const result = EXT_X_I_FRAME_STREAM_INF_CODEC.decode(tag);
            expect(result).toMatchObject({
                URI: 'https://example.com/iframe.m3u8',
                BANDWIDTH: 1280000,
                'AVERAGE-BANDWIDTH': 1000000,
                CODECS: ['mp4a.40.5'],
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
                'HDCP-LEVEL': 'TYPE-0',
                VIDEO: 'video',
            });
        });
    });

    describe('EXT_X_I_FRAME_STREAM_INF_CODEC encoding', () => {
        it('should encode a valid EXT_X_I_FRAME_STREAM_INF tag', () => {
            const input = {
                URI: 'https://example.com/iframe.m3u8',
                BANDWIDTH: 1280000,
                'AVERAGE-BANDWIDTH': 1000000,
                CODECS: ['mp4a.40.5'],
                RESOLUTION: {
                    width: 1920,
                    height: 1080,
                },
                'HDCP-LEVEL': 'TYPE-0' as const,
                VIDEO: 'video',
            };
            const result = EXT_X_I_FRAME_STREAM_INF_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,CODECS="mp4a.40.5",RESOLUTION=1920x1080,HDCP-LEVEL=TYPE-0,VIDEO="video"\nhttps://example.com/iframe.m3u8',
            );
        });
    });
});
