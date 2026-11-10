// These tests pin section 4.4.6.5: EXT-X-SESSION-KEY takes EXT-X-KEY's
// attributes, its METHOD is never NONE, and no two session keys share every
// attribute. Each case breaks one rule once.
import { describe, expect, test } from "vitest";

import { extXKeyRules, KeyMethod } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import {
    checkSessionKeys,
    extXSessionKeyRules,
    extXSessionKeySchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.5-ext-x-session-key.js";

const IV = "0x0123456789ABCDEF0123456789ABCDEF";

describe("extXSessionKeySchema", () => {
    test("converts EXT-X-KEY's attributes", () => {
        const attributes = { METHOD: "SAMPLE-AES", URI: '"skd://key"', KEYFORMAT: '"com.apple.streamingkeydelivery"', KEYFORMATVERSIONS: '"1"' };
        const key = { METHOD: KeyMethod.sampleAes, URI: "skd://key", KEYFORMAT: "com.apple.streamingkeydelivery", KEYFORMATVERSIONS: "1" };
        expect(extXSessionKeySchema.safeParse(attributes)).toEqual({ success: true, data: key });
    });

    test("rejects a missing METHOD", () => {
        expect(extXSessionKeySchema.safeParse({ URI: '"k"' }).success).toBe(false);
    });
});

describe("checkSessionKeys", () => {
    test("accepts session keys differing in one attribute", () => {
        const keys = [
            { METHOD: KeyMethod.aes128, URI: "k", IV },
            { METHOD: KeyMethod.aes128, URI: "k" },
            { METHOD: KeyMethod.sampleAes, URI: "k" },
        ] as const;
        expect(checkSessionKeys(keys)).toEqual([]);
    });

    const broken = [
        { name: "METHOD=NONE", keys: [{ METHOD: KeyMethod.none }], rule: extXSessionKeyRules.methodNotNone },
        { name: "a session key without a URI", keys: [{ METHOD: KeyMethod.aes128 }], rule: extXKeyRules.uriRequired },
        { name: "an AES-256-GCM session key with an IV", keys: [{ METHOD: KeyMethod.aes256Gcm, URI: "k", IV }], rule: extXKeyRules.ivForbidden },
        {
            name: "two identical session keys",
            keys: [{ METHOD: KeyMethod.aes128, URI: "k", KEYFORMAT: "identity" }, { METHOD: KeyMethod.aes128, URI: "k", KEYFORMAT: "identity" }],
            rule: extXSessionKeyRules.distinctKeys,
        },
    ] as const;

    test.each(broken)("reports $name", ({ keys, rule }) => {
        expect(checkSessionKeys(keys)).toMatchObject([{ rule }]);
    });
});
