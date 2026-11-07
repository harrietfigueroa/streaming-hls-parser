// These tests pin section 4.4.5.1: EXT-X-DATERANGE's attributes convert, X-
// attributes keep their typed values, and each rule that spans a playlist's
// Date Ranges is broken once.
import { describe, expect, test } from "vitest";

import { dateTimeSchema } from "../../../../src/library/date-time.js";
import { AssertionError } from "../../../../src/library/assert.js";
import {
    checkDateRanges,
    Cue,
    extXDateRangeRules,
    extXDateRangeSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.1-ext-x-daterange.js";

const START = "2014-03-05T11:15:00Z";
const END = "2014-03-05T11:16:00Z";

describe("extXDateRangeSchema", () => {
    test("converts every attribute and keeps X- attributes by type", () => {
        const attributes = {
            ID: '"splice-6FFFFFF0"',
            CLASS: '"com.example.ad"',
            "START-DATE": `"${START}"`,
            CUE: '"PRE,ONCE"',
            "END-DATE": `"${END}"`,
            DURATION: "60",
            "PLANNED-DURATION": "59.993",
            "SCTE35-OUT": "0xFC002F0000",
            "X-COM-EXAMPLE-AD-ID": '"XYZ123"',
            "X-COM-EXAMPLE-OFFSET": "-1.5",
            "X-COM-EXAMPLE-BLOB": "0xAB",
        };
        const dateRange = {
            ID: "splice-6FFFFFF0",
            CLASS: "com.example.ad",
            "START-DATE": START,
            CUE: [Cue.pre, Cue.once],
            "END-DATE": END,
            DURATION: 60,
            "PLANNED-DURATION": 59.993,
            "SCTE35-OUT": "0xFC002F0000",
            clientAttributes: { "X-COM-EXAMPLE-AD-ID": "XYZ123", "X-COM-EXAMPLE-OFFSET": -1.5, "X-COM-EXAMPLE-BLOB": "0xAB" },
        };
        expect(extXDateRangeSchema.safeParse(attributes)).toEqual({ success: true, data: dateRange });
    });

    test.each([{}, { ID: '"a"', "START-DATE": '"tomorrow"' }, { ID: '"a"', "X-ENUM": "YES" }, { ID: '"a"', "END-ON-NEXT": "NO" }])(
        "rejects %j",
        (attributes) => {
            expect(extXDateRangeSchema.safeParse(attributes).success).toBe(false);
        },
    );
});

function dateTime(text: string) {
    const result = dateTimeSchema.safeParse(text);
    if (result.success) {
        return result.data;
    }
    throw new AssertionError(`Fixture ${text} is not a date-time.`);
}

describe("checkDateRanges", () => {
    const start = dateTime(START);
    const end = dateTime(END);

    test("accepts consistent ranges, one inheriting its START-DATE by ID", () => {
        const dateRanges = [
            { ID: "a", "START-DATE": start, CLASS: "c", "END-ON-NEXT": "YES" },
            { ID: "b", "START-DATE": start, "END-DATE": end, DURATION: 60 },
            { ID: "b", "PLANNED-DURATION": 60 },
        ] as const;
        expect(checkDateRanges({ dateRanges, hasProgramDateTime: true })).toEqual([]);
    });

    const broken = [
        { name: "no START-DATE", dateRanges: [{ ID: "a" }], rule: extXDateRangeRules.startDateRequired },
        { name: "an END-DATE before START-DATE", dateRanges: [{ ID: "a", "START-DATE": end, "END-DATE": start }], rule: extXDateRangeRules.endAfterStart },
        { name: "a CUE of PRE and POST", dateRanges: [{ ID: "a", "START-DATE": start, CUE: ["PRE", "POST"] }], rule: extXDateRangeRules.cueExclusive },
        { name: "END-ON-NEXT without CLASS", dateRanges: [{ ID: "a", "START-DATE": start, "END-ON-NEXT": "YES" }], rule: extXDateRangeRules.endOnNextClass },
        { name: "END-ON-NEXT with a DURATION", dateRanges: [{ ID: "a", "START-DATE": start, CLASS: "c", "END-ON-NEXT": "YES", DURATION: 1 }], rule: extXDateRangeRules.endOnNextAlone },
        { name: "a DURATION disagreeing with END-DATE", dateRanges: [{ ID: "a", "START-DATE": start, "END-DATE": end, DURATION: 30 }], rule: extXDateRangeRules.durationMatchesEnd },
        { name: "a repeat changing an attribute", dateRanges: [{ ID: "a", "START-DATE": start, CLASS: "c" }, { ID: "a", CLASS: "d" }], rule: extXDateRangeRules.consistentRepeats },
        { name: "a third tag changing the second's attribute", dateRanges: [{ ID: "a", "START-DATE": start }, { ID: "a", DURATION: 1 }, { ID: "a", DURATION: 2 }], rule: extXDateRangeRules.consistentRepeats },
        { name: "a repeat changing an X- attribute", dateRanges: [{ ID: "a", "START-DATE": start, clientAttributes: { "X-A": "1" } }, { ID: "a", clientAttributes: { "X-A": "2" } }], rule: extXDateRangeRules.consistentRepeats },
    ] as const;

    test.each(broken)("reports $name", ({ dateRanges, rule }) => {
        expect(checkDateRanges({ dateRanges, hasProgramDateTime: true })).toMatchObject([{ rule }]);
    });

    test("reports Date Ranges in a playlist with no EXT-X-PROGRAM-DATE-TIME", () => {
        const dateRanges = [{ ID: "a", "START-DATE": start }] as const;
        const issues = checkDateRanges({ dateRanges, hasProgramDateTime: false });
        expect(issues).toMatchObject([{ rule: extXDateRangeRules.programDateTimeRequired }]);
    });
});
