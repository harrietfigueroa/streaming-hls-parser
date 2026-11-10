// These tests pin section 4.4.4.4: EXT-X-KEY's attributes convert, and each
// rule the section sets between METHOD and the other attributes is broken
// once.
import { describe, expect, test } from "vitest";

import { checkKey, extXKeyRules, extXKeySchema, KeyMethod } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";

const IV = "0x0123456789ABCDEF0123456789ABCDEF";

describe("extXKeySchema", () => {
    test("converts every attribute", () => {
        const attributes = {
            METHOD: "AES-128",
            URI: '"https://example.com/key"',
            IV,
            KEYFORMAT: '"identity"',
            KEYFORMATVERSIONS: '"1/2/5"',
        };
        const key = { METHOD: KeyMethod.aes128, URI: "https://example.com/key", IV, KEYFORMAT: "identity", KEYFORMATVERSIONS: "1/2/5" };
        expect(extXKeySchema.safeParse(attributes)).toEqual({ success: true, data: key });
    });

    test.each([
        {},
        { METHOD: "NONE", IV: "0x0123456789ABCDEF0123456789ABCDEF0" },
        { METHOD: "NONE", KEYFORMATVERSIONS: '"1//2"' },
        { METHOD: "NONE", KEYFORMATVERSIONS: '"0"' },
    ])("rejects %j", (attributes) => {
        expect(extXKeySchema.safeParse(attributes).success).toBe(false);
    });
});

describe("checkKey", () => {
    test.each([
        { METHOD: KeyMethod.none },
        { METHOD: KeyMethod.aes128, URI: "k", IV },
        { METHOD: KeyMethod.sampleAes, URI: "k" },
        { METHOD: KeyMethod.aes256Gcm, URI: "k" },
    ] as const)("accepts %j", (key) => {
        expect(checkKey(key)).toEqual([]);
    });

    test.each([
        { name: "NONE with a URI", key: { METHOD: KeyMethod.none, URI: "k" }, rule: extXKeyRules.noneAlone },
        { name: "AES-128 without a URI", key: { METHOD: KeyMethod.aes128 }, rule: extXKeyRules.uriRequired },
        { name: "AES-256-GCM with an IV", key: { METHOD: KeyMethod.aes256Gcm, URI: "k", IV }, rule: extXKeyRules.ivForbidden },
        { name: "SAMPLE-AES-CTR with an IV", key: { METHOD: KeyMethod.sampleAesCtr, URI: "k", IV }, rule: extXKeyRules.ivForbidden },
    ] as const)("reports $name", ({ key, rule }) => {
        expect(checkKey(key)).toMatchObject([{ rule }]);
    });
});
