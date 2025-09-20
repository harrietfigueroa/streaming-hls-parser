import { describe, expect, it } from 'vitest';
import { EXT_X_SESSION_KEY_CODEC } from './schema';

describe('EXT-X-SESSION-KEY schema', () => {
    describe('EXT_X_SESSION_KEY_CODEC decoding', () => {
        it('should decode a valid EXT-X-SESSION-KEY tag with AES-128', () => {
            const tag = '#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin"';
            const result = EXT_X_SESSION_KEY_CODEC.decode(tag);
            expect(result).toMatchObject({
                METHOD: 'AES-128',
                URI: 'https://example.com/key.bin',
            });
        });

        it('should decode a valid EXT-X-SESSION-KEY tag with SAMPLE-AES', () => {
            const tag =
                '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key.bin",KEYFORMAT="identity"';
            const result = EXT_X_SESSION_KEY_CODEC.decode(tag);
            expect(result).toMatchObject({
                METHOD: 'SAMPLE-AES',
                URI: 'https://example.com/key.bin',
                KEYFORMAT: 'identity',
            });
        });

        it('should decode with IV attribute', () => {
            const tag =
                '#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",IV="0x1234567890ABCDEF1234567890ABCDEF"';
            const result = EXT_X_SESSION_KEY_CODEC.decode(tag);
            expect(result).toMatchObject({
                METHOD: 'AES-128',
                URI: 'https://example.com/key.bin',
                IV: '0x1234567890ABCDEF1234567890ABCDEF',
            });
        });

        it('should decode with KEYFORMAT and KEYFORMATVERSIONS', () => {
            const tag =
                '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key.bin",KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1"';
            const result = EXT_X_SESSION_KEY_CODEC.decode(tag);
            expect(result).toMatchObject({
                METHOD: 'SAMPLE-AES',
                URI: 'https://example.com/key.bin',
                KEYFORMAT: 'com.apple.streamingkeydelivery',
                KEYFORMATVERSIONS: '1',
            });
        });

        it('should decode with complex KEYFORMATVERSIONS', () => {
            const tag =
                '#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",KEYFORMAT="com.widevine",KEYFORMATVERSIONS="1/2/5"';
            const result = EXT_X_SESSION_KEY_CODEC.decode(tag);
            expect(result).toMatchObject({
                METHOD: 'AES-128',
                URI: 'https://example.com/key.bin',
                KEYFORMAT: 'com.widevine',
                KEYFORMATVERSIONS: '1/2/5',
            });
        });

        it('should decode with all attributes', () => {
            const tag =
                '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key.bin",IV="0x1234567890ABCDEF1234567890ABCDEF",KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1"';
            const result = EXT_X_SESSION_KEY_CODEC.decode(tag);
            expect(result).toMatchObject({
                METHOD: 'SAMPLE-AES',
                URI: 'https://example.com/key.bin',
                IV: '0x1234567890ABCDEF1234567890ABCDEF',
                KEYFORMAT: 'com.apple.streamingkeydelivery',
                KEYFORMATVERSIONS: '1',
            });
        });
    });

    describe('EXT_X_SESSION_KEY_CODEC encoding', () => {
        it('should encode a valid EXT-X-SESSION-KEY tag with AES-128', () => {
            const input = {
                METHOD: 'AES-128' as const,
                URI: 'https://example.com/key.bin',
            };
            const result = EXT_X_SESSION_KEY_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin"',
            );
        });

        it('should encode a valid EXT-X-SESSION-KEY tag with SAMPLE-AES', () => {
            const input = {
                METHOD: 'SAMPLE-AES' as const,
                URI: 'https://example.com/key.bin',
                KEYFORMAT: 'identity',
            };
            const result = EXT_X_SESSION_KEY_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key.bin",KEYFORMAT="identity"',
            );
        });

        it('should encode with IV attribute', () => {
            const input = {
                METHOD: 'AES-128' as const,
                URI: 'https://example.com/key.bin',
                IV: '0x1234567890ABCDEF1234567890ABCDEF',
            };
            const result = EXT_X_SESSION_KEY_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",IV=0x1234567890ABCDEF1234567890ABCDEF',
            );
        });

        it('should encode with KEYFORMAT and KEYFORMATVERSIONS', () => {
            const input = {
                METHOD: 'SAMPLE-AES' as const,
                URI: 'https://example.com/key.bin',
                KEYFORMAT: 'com.apple.streamingkeydelivery',
                KEYFORMATVERSIONS: '1',
            };
            const result = EXT_X_SESSION_KEY_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key.bin",KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1"',
            );
        });

        it('should encode with all attributes', () => {
            const input = {
                METHOD: 'SAMPLE-AES' as const,
                URI: 'https://example.com/key.bin',
                IV: '0x1234567890ABCDEF1234567890ABCDEF',
                KEYFORMAT: 'com.apple.streamingkeydelivery',
                KEYFORMATVERSIONS: '1',
            };
            const result = EXT_X_SESSION_KEY_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="https://example.com/key.bin",IV=0x1234567890ABCDEF1234567890ABCDEF,KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1"',
            );
        });
    });

    describe('EXT_X_SESSION_KEY_CODEC validation', () => {
        it('should reject METHOD=NONE', () => {
            const tag = '#EXT-X-SESSION-KEY:METHOD=NONE';
            expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).toThrow(
                'METHOD attribute MUST NOT be NONE',
            );
        });

        it('should reject missing METHOD', () => {
            const tag = '#EXT-X-SESSION-KEY:URI="https://example.com/key.bin"';
            expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).toThrow();
        });

        it('should reject invalid METHOD', () => {
            const tag = '#EXT-X-SESSION-KEY:METHOD=INVALID,URI="https://example.com/key.bin"';
            expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).toThrow();
        });

        it('should accept valid METHODS', () => {
            const validMethods = ['AES-128', 'SAMPLE-AES'];

            validMethods.forEach((method) => {
                const tag = `#EXT-X-SESSION-KEY:METHOD=${method},URI="https://example.com/key.bin"`;
                expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid KEYFORMATVERSIONS formats', () => {
            const validVersions = ['1', '1/2', '1/2/5', '2/3', '10'];

            validVersions.forEach((version) => {
                const tag = `#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",KEYFORMATVERSIONS="${version}"`;
                expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid IV formats', () => {
            const validIVs = [
                '0x1234567890ABCDEF1234567890ABCDEF',
                '0x00000000000000000000000000000000',
                '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            ];

            validIVs.forEach((iv) => {
                const tag = `#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",IV="${iv}"`;
                expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid URIs', () => {
            const validUris = [
                'https://example.com/key.bin',
                'http://example.com/key.bin',
                'https://subdomain.example.com/path/to/key.bin',
                'https://example.com:8080/key.bin',
                'https://example.com/key.bin?param=value',
            ];

            validUris.forEach((uri) => {
                const tag = `#EXT-X-SESSION-KEY:METHOD=AES-128,URI="${uri}"`;
                expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should accept valid KEYFORMAT values', () => {
            const validKeyFormats = [
                'identity',
                'com.apple.streamingkeydelivery',
                'com.widevine',
                'urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed',
            ];

            validKeyFormats.forEach((keyFormat) => {
                const tag = `#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",KEYFORMAT="${keyFormat}"`;
                expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).not.toThrow();
            });
        });
    });

    describe('EXT_X_SESSION_KEY_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle with AES-128', () => {
            const original = {
                METHOD: 'AES-128' as const,
                URI: 'https://example.com/key.bin',
            };

            const encoded = EXT_X_SESSION_KEY_CODEC.encode(original);
            const decoded = EXT_X_SESSION_KEY_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with SAMPLE-AES', () => {
            const original = {
                METHOD: 'SAMPLE-AES' as const,
                URI: 'https://example.com/key.bin',
                KEYFORMAT: 'identity',
            };

            const encoded = EXT_X_SESSION_KEY_CODEC.encode(original);
            const decoded = EXT_X_SESSION_KEY_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with all attributes', () => {
            const original = {
                METHOD: 'SAMPLE-AES' as const,
                URI: 'https://example.com/key.bin',
                IV: '0x1234567890ABCDEF1234567890ABCDEF',
                KEYFORMAT: 'com.apple.streamingkeydelivery',
                KEYFORMATVERSIONS: '1',
            };

            const encoded = EXT_X_SESSION_KEY_CODEC.encode(original);
            const decoded = EXT_X_SESSION_KEY_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });
    });

    describe('EXT_X_SESSION_KEY_CODEC business logic validation', () => {
        it('should enforce that METHOD cannot be NONE (key difference from EXT-X-KEY)', () => {
            // This is the main difference between EXT-X-KEY and EXT-X-SESSION-KEY
            const tag = '#EXT-X-SESSION-KEY:METHOD=NONE';
            expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).toThrow(
                'METHOD attribute MUST NOT be NONE',
            );
        });

        it('should allow all other attributes that EXT-X-KEY allows', () => {
            // Test that all other functionality from EXT-X-KEY is preserved
            const tag =
                '#EXT-X-SESSION-KEY:METHOD=AES-128,URI="https://example.com/key.bin",IV="0x1234567890ABCDEF1234567890ABCDEF",KEYFORMAT="identity",KEYFORMATVERSIONS="1"';
            expect(() => EXT_X_SESSION_KEY_CODEC.decode(tag)).not.toThrow();
        });
    });
});
