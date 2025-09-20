import { describe, expect, it } from 'vitest';
import { EXT_X_SESSION_DATA_CODEC } from './schema';

describe('EXT-X-SESSION-DATA schema', () => {
    describe('EXT_X_SESSION_DATA_CODEC decoding', () => {
        it('should decode a valid EXT-X-SESSION-DATA tag with VALUE', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",VALUE="This is an example"';
            const result = EXT_X_SESSION_DATA_CODEC.decode(tag);
            expect(result).toMatchObject({
                'DATA-ID': 'com.example.title',
                VALUE: 'This is an example',
            });
        });

        it('should decode a valid EXT-X-SESSION-DATA tag with URI', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.lyrics",URI="https://example.com/lyrics.json"';
            const result = EXT_X_SESSION_DATA_CODEC.decode(tag);
            expect(result).toMatchObject({
                'DATA-ID': 'com.example.lyrics',
                URI: 'https://example.com/lyrics.json',
            });
        });

        it('should decode a valid EXT-X-SESSION-DATA tag with VALUE and LANGUAGE', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="en",VALUE="This is an example"';
            const result = EXT_X_SESSION_DATA_CODEC.decode(tag);
            expect(result).toMatchObject({
                'DATA-ID': 'com.example.title',
                LANGUAGE: 'en',
                VALUE: 'This is an example',
            });
        });

        it('should decode with complex language tag', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="zh-Hans-CN",VALUE="这是一个例子"';
            const result = EXT_X_SESSION_DATA_CODEC.decode(tag);
            expect(result).toMatchObject({
                'DATA-ID': 'com.example.title',
                LANGUAGE: 'zh-Hans-CN',
                VALUE: '这是一个例子',
            });
        });

        it('should decode with reverse DNS DATA-ID', () => {
            const tag = '#EXT-X-SESSION-DATA:DATA-ID="com.example.movie.title",VALUE="Movie Title"';
            const result = EXT_X_SESSION_DATA_CODEC.decode(tag);
            expect(result).toMatchObject({
                'DATA-ID': 'com.example.movie.title',
                VALUE: 'Movie Title',
            });
        });

        it('should decode with complex DATA-ID', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="org.example.app.config",URI="https://example.com/config.json"';
            const result = EXT_X_SESSION_DATA_CODEC.decode(tag);
            expect(result).toMatchObject({
                'DATA-ID': 'org.example.app.config',
                URI: 'https://example.com/config.json',
            });
        });
    });

    describe('EXT_X_SESSION_DATA_CODEC encoding', () => {
        it('should encode a valid EXT-X-SESSION-DATA tag with VALUE', () => {
            const input = {
                'DATA-ID': 'com.example.title',
                VALUE: 'This is an example',
            };
            const result = EXT_X_SESSION_DATA_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",VALUE="This is an example"',
            );
        });

        it('should encode a valid EXT-X-SESSION-DATA tag with URI', () => {
            const input = {
                'DATA-ID': 'com.example.lyrics',
                URI: 'https://example.com/lyrics.json',
            };
            const result = EXT_X_SESSION_DATA_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.lyrics",URI="https://example.com/lyrics.json"',
            );
        });

        it('should encode a valid EXT-X-SESSION-DATA tag with VALUE and LANGUAGE', () => {
            const input = {
                'DATA-ID': 'com.example.title',
                LANGUAGE: 'en',
                VALUE: 'This is an example',
            };
            const result = EXT_X_SESSION_DATA_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",VALUE="This is an example",LANGUAGE="en"',
            );
        });

        it('should encode with complex language tag', () => {
            const input = {
                'DATA-ID': 'com.example.title',
                LANGUAGE: 'zh-Hans-CN',
                VALUE: '这是一个例子',
            };
            const result = EXT_X_SESSION_DATA_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",VALUE="这是一个例子",LANGUAGE="zh-Hans-CN"',
            );
        });

        it('should encode with all attributes', () => {
            const input = {
                'DATA-ID': 'com.example.movie.title',
                LANGUAGE: 'en-US',
                VALUE: 'Movie Title',
            };
            const result = EXT_X_SESSION_DATA_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.movie.title",VALUE="Movie Title",LANGUAGE="en-US"',
            );
        });
    });

    describe('EXT_X_SESSION_DATA_CODEC validation', () => {
        it('should reject empty DATA-ID', () => {
            const tag = '#EXT-X-SESSION-DATA:DATA-ID="",VALUE="test"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow('DATA-ID must not be empty');
        });

        it('should reject missing DATA-ID', () => {
            const tag = '#EXT-X-SESSION-DATA:VALUE="test"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow();
        });

        it('should reject empty VALUE', () => {
            const tag = '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",VALUE=""';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow('VALUE must not be empty');
        });

        it('should reject invalid URI format', () => {
            const tag = '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",URI="not-a-valid-url"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow('URI must be a valid URL');
        });

        it('should reject invalid language tag format', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",LANGUAGE="invalid-lang",VALUE="test"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow(
                'LANGUAGE must be a valid RFC5646 language tag',
            );
        });

        it('should reject both VALUE and URI present', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",VALUE="test",URI="https://example.com/test.json"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow(
                'must contain either a VALUE or URI attribute, but not both',
            );
        });

        it('should reject neither VALUE nor URI present', () => {
            const tag = '#EXT-X-SESSION-DATA:DATA-ID="com.example.test"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow(
                'must contain either a VALUE or URI attribute, but not both',
            );
        });

        it('should reject LANGUAGE with URI (should only be with VALUE)', () => {
            const tag =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",LANGUAGE="en",URI="https://example.com/test.json"';
            expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).toThrow(
                'LANGUAGE attribute can only be used with VALUE attribute, not with URI',
            );
        });

        it('should accept valid language tags', () => {
            const validLanguages = ['en', 'en-US', 'zh-Hans-CN', 'fr-CA', 'de-DE', 'ja-JP'];

            validLanguages.forEach((lang) => {
                const tag =
                    `#EXT-X-SESSION-DATA:DATA-ID="com.example.test",LANGUAGE="${lang}",VALUE="test"` as const;
                expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should reject invalid language tags', () => {
            // Test specific invalid cases
            expect(() =>
                EXT_X_SESSION_DATA_CODEC.decode(
                    '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",LANGUAGE="invalid",VALUE="test"',
                ),
            ).toThrow();
            expect(() =>
                EXT_X_SESSION_DATA_CODEC.decode(
                    '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",LANGUAGE="123",VALUE="test"',
                ),
            ).toThrow();
            expect(() =>
                EXT_X_SESSION_DATA_CODEC.decode(
                    '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",LANGUAGE="en-",VALUE="test"',
                ),
            ).toThrow();
        });

        it('should accept valid URIs', () => {
            const validUris = [
                'https://example.com/test.json',
                'http://example.com/test.json',
                'https://subdomain.example.com/path/to/file.json',
                'https://example.com:8080/test.json',
                'https://example.com/test.json?param=value',
            ];

            validUris.forEach((uri) => {
                const tag = `#EXT-X-SESSION-DATA:DATA-ID="com.example.test",URI="${uri}"` as const;
                expect(() => EXT_X_SESSION_DATA_CODEC.decode(tag)).not.toThrow();
            });
        });

        it('should reject invalid URIs', () => {
            // Test specific invalid cases
            expect(() =>
                EXT_X_SESSION_DATA_CODEC.decode(
                    '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",URI="not-a-url"',
                ),
            ).toThrow();
            expect(() =>
                EXT_X_SESSION_DATA_CODEC.decode(
                    '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",URI="example.com/test.json"',
                ),
            ).toThrow();
            expect(() =>
                EXT_X_SESSION_DATA_CODEC.decode(
                    '#EXT-X-SESSION-DATA:DATA-ID="com.example.test",URI="https://"',
                ),
            ).toThrow();
        });
    });

    describe('EXT_X_SESSION_DATA_CODEC round-trip encoding/decoding', () => {
        it('should maintain data integrity through encode/decode cycle with VALUE', () => {
            const original = {
                'DATA-ID': 'com.example.title',
                VALUE: 'This is an example',
            };

            const encoded = EXT_X_SESSION_DATA_CODEC.encode(original);
            const decoded = EXT_X_SESSION_DATA_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with URI', () => {
            const original = {
                'DATA-ID': 'com.example.lyrics',
                URI: 'https://example.com/lyrics.json',
            };

            const encoded = EXT_X_SESSION_DATA_CODEC.encode(original);
            const decoded = EXT_X_SESSION_DATA_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });

        it('should maintain data integrity through encode/decode cycle with all attributes', () => {
            const original = {
                'DATA-ID': 'com.example.movie.title',
                LANGUAGE: 'en-US',
                VALUE: 'Movie Title',
            };

            const encoded = EXT_X_SESSION_DATA_CODEC.encode(original);
            const decoded = EXT_X_SESSION_DATA_CODEC.decode(encoded);

            expect(decoded).toMatchObject(original);
        });
    });
});
