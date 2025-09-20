import { describe, expect, it, vi } from 'vitest';
import { EXT_X_MEDIA_CODEC } from './schema';

describe('EXT-X-MEDIA schema', () => {
    describe('EXT-X-MEDIA_CODEC decoding', () => {
        it('should decode a valid AUDIO EXT-X-MEDIA tag', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-group",NAME="English Audio",URI="https://example.com/audio.m3u8",LANGUAGE="en",DEFAULT=YES,AUTOSELECT=YES,CHANNELS="2"';
            const result = EXT_X_MEDIA_CODEC.decode(tag);
            expect(result).toMatchObject({
                TYPE: 'AUDIO',
                'GROUP-ID': 'audio-group',
                NAME: 'English Audio',
                URI: 'https://example.com/audio.m3u8',
                LANGUAGE: 'en',
                DEFAULT: 'YES',
                AUTOSELECT: 'YES',
                CHANNELS: '2',
            });
        });

        it('should decode a valid SUBTITLES EXT-X-MEDIA tag', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subtitle-group",NAME="English Subtitles",URI="https://example.com/subtitles.m3u8",LANGUAGE="en",FORCED=NO';
            const result = EXT_X_MEDIA_CODEC.decode(tag);
            expect(result).toMatchObject({
                TYPE: 'SUBTITLES',
                'GROUP-ID': 'subtitle-group',
                NAME: 'English Subtitles',
                URI: 'https://example.com/subtitles.m3u8',
                LANGUAGE: 'en',
                FORCED: 'NO',
            });
        });

        it('should decode a valid CLOSED-CAPTIONS EXT-X-MEDIA tag', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc-group",NAME="Closed Captions",INSTREAM-ID="CC1"';
            const result = EXT_X_MEDIA_CODEC.decode(tag);
            expect(result).toMatchObject({
                TYPE: 'CLOSED-CAPTIONS',
                'GROUP-ID': 'cc-group',
                NAME: 'Closed Captions',
                'INSTREAM-ID': 'CC1',
            });
        });

        it('should decode a valid VIDEO EXT-X-MEDIA tag', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="video-group",NAME="Camera Angle 1",URI="https://example.com/video.m3u8"';
            const result = EXT_X_MEDIA_CODEC.decode(tag);
            expect(result).toMatchObject({
                TYPE: 'VIDEO',
                'GROUP-ID': 'video-group',
                NAME: 'Camera Angle 1',
                URI: 'https://example.com/video.m3u8',
            });
        });

        it('should decode with SERVICE INSTREAM-ID', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc-group",NAME="Service 1",INSTREAM-ID="SERVICE1"';
            const result = EXT_X_MEDIA_CODEC.decode(tag);
            expect(result).toMatchObject({
                TYPE: 'CLOSED-CAPTIONS',
                'GROUP-ID': 'cc-group',
                NAME: 'Service 1',
                'INSTREAM-ID': 'SERVICE1',
            });
        });

        it('should decode with CHARACTERISTICS attribute', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subtitle-group",NAME="Accessible Subtitles",URI="https://example.com/subtitles.m3u8",CHARACTERISTICS="public.accessibility.transcribes-spoken-dialog,public.easy-to-read"';
            const result = EXT_X_MEDIA_CODEC.decode(tag);
            expect(result).toMatchObject({
                TYPE: 'SUBTITLES',
                'GROUP-ID': 'subtitle-group',
                NAME: 'Accessible Subtitles',
                URI: 'https://example.com/subtitles.m3u8',
                CHARACTERISTICS:
                    'public.accessibility.transcribes-spoken-dialog,public.easy-to-read',
            });
        });
    });

    describe('EXT-X-MEDIA_CODEC encoding', () => {
        it('should encode with SERVICE INSTREAM-ID', () => {
            const input = {
                TYPE: 'CLOSED-CAPTIONS' as const,
                'GROUP-ID': 'cc-group',
                NAME: 'Service 1',
                'INSTREAM-ID': 'SERVICE1' as const,
            };
            const result = EXT_X_MEDIA_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc-group",NAME="Service 1",INSTREAM-ID="SERVICE1"',
            );
        });
    });

    describe('EXT-X-MEDIA_CODEC validation', () => {
        it('should reject CLOSED-CAPTIONS with URI', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc-group",NAME="Closed Captions",URI="https://example.com/cc.m3u8",INSTREAM-ID="CC1"';
            expect(() => EXT_X_MEDIA_CODEC.decode(tag)).toThrow();
        });

        it('should reject CLOSED-CAPTIONS without INSTREAM-ID', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc-group",NAME="Closed Captions"';
            expect(() => EXT_X_MEDIA_CODEC.decode(tag)).toThrow();
        });

        it('should reject FORCED attribute with non-SUBTITLES TYPE', () => {
            const tag = '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-group",NAME="Audio",FORCED=YES';
            expect(() => EXT_X_MEDIA_CODEC.decode(tag)).toThrow();
        });

        it('should reject DEFAULT=YES with AUTOSELECT=NO', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-group",NAME="Audio",DEFAULT=YES,AUTOSELECT=NO';
            expect(() => EXT_X_MEDIA_CODEC.decode(tag)).toThrow();
        });

        it('should reject invalid TYPE', () => {
            const tag = '#EXT-X-MEDIA:TYPE=INVALID,GROUP-ID="group",NAME="Name"';
            expect(() => EXT_X_MEDIA_CODEC.decode(tag)).toThrow();
        });

        it('should reject invalid INSTREAM-ID format', () => {
            const tag =
                '#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc-group",NAME="Closed Captions",INSTREAM-ID="INVALID"';
            expect(() => EXT_X_MEDIA_CODEC.decode(tag)).toThrow();
        });
    });
});
