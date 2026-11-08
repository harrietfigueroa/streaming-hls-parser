// These tests pin the date-times: the schema accepts ISO 8601
// date-times with an offset, keeping the text as written, rejects every field
// out of its range, and the conversions agree with Date.parse on valid text.
import { describe, expect, test } from "vitest";

import { AssertionError } from "../../src/library/assert.js";
import { dateTimeSchema, toDate, toEpochMilliseconds, toInstant } from "../../src/library/date-time.js";

const valid = [
    "2010-02-19T14:54:23.031+08:00",
    "2010-02-19T14:54:23.031+0800",
    "2010-02-19T14:54:23Z",
    "2024-02-29T00:00:00.000-05:30",
    "2000-02-29T00:00:00Z",
    "0000-02-29T00:00:00Z",
    "2010-12-31T23:59:59.999999999-23:59",
    "2010-04-30T00:00:00.5+0000",
] as const;

const invalid = [
    "2010-02-19T14:54:23.031",
    "2010-02-30T00:00:00Z",
    "2023-02-29T00:00:00Z",
    "2010-13-01T00:00:00Z",
    "2010-02-19T24:00:00Z",
    "2010-02-19T14:60:00Z",
    "2010-02-19T14:54:60Z",
    "2010-02-19T14:54:23+24:00",
    "2010-02-19 14:54:23Z",
    "",
    "1900-02-29T00:00:00Z",
    "2010-04-31T00:00:00Z",
    "2010-00-01T00:00:00Z",
    "2010-01-00T00:00:00Z",
    "2010-02-19T14:54:23+08:60",
    "2010-02-19T14:54:23.Z",
    "2010-02-19T14:54:23z",
    "2010-02-19t14:54:23Z",
    "2010-02-19T14:54:23+08:0",
    "2010-02-19T14:54:23+080",
    "2010-02-19T14:54:23+08:000",
    "2010-02-19T14:54:23Z ",
    " 2010-02-19T14:54:23Z",
    "2010-02-19T14:54:23",
    "2010-02-19T14:54Z",
    "2010-2-19T14:54:23Z",
    "20100-02-19T14:54:23Z",
    "2010-02-19T1a:54:23Z",
    "2010-02-19T14:54:23.03a+08:00",
    "2010/02/19T14:54:23Z",
    "2010-02-19T14-54-23Z",
    "2010-02-19T14:54:23 08:00",
    "２010-02-19T14:54:23Z",
] as const;

describe("dateTimeSchema", () => {
    test.each(valid)("keeps %s as written", (text) => {
        expect(dateTimeSchema.safeParse(text)).toEqual({ success: true, data: text });
    });

    test.each(invalid)("rejects %j", (text) => {
        expect(dateTimeSchema.safeParse(text).success).toBe(false);
    });
});

function parseDateTime(text: string) {
    const result = dateTimeSchema.safeParse(text);
    if (result.success) {
        return result.data;
    }
    throw new AssertionError(`Fixture ${text} is not a date-time.`);
}

describe("date-time conversions", () => {
    test.each(valid)("converts %s to its instant", (text) => {
        const dateTime = parseDateTime(text);
        const epochMilliseconds = Date.parse(text);
        expect(toEpochMilliseconds(dateTime)).toBe(epochMilliseconds);
        expect(toDate(dateTime).getTime()).toBe(epochMilliseconds);
    });

    test("returns a new Date on each call", () => {
        const dateTime = parseDateTime(valid[0]);
        expect(toDate(dateTime)).not.toBe(toDate(dateTime));
    });

    test("hands the text to the Temporal namespace it is given", () => {
        const dateTime = parseDateTime(valid[0]);
        function from(item: string) {
            return { epochMilliseconds: Date.parse(item) };
        }
        const instant = toInstant(dateTime, { Instant: { from } });
        expect(instant).toEqual({ epochMilliseconds: Date.parse(valid[0]) });
    });
});
