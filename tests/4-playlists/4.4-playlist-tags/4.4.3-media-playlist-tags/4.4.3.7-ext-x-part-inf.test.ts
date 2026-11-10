// These tests pin section 4.4.3.7: EXT-X-PART-INF requires a PART-TARGET,
// converted as a decimal-floating-point number of seconds.
import { describe, expect, test } from "vitest";

import { extXPartInfSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";

describe("extXPartInfSchema", () => {
    test("converts PART-TARGET", () => {
        const result = extXPartInfSchema.safeParse({ "PART-TARGET": "1.004" });
        expect(result).toEqual({ success: true, data: { "PART-TARGET": 1.004 } });
    });

    test.each([{}, { "PART-TARGET": "-1" }, { "PART-TARGET": "one" }])("rejects %j", (attributes) => {
        expect(extXPartInfSchema.safeParse(attributes).success).toBe(false);
    });
});
