// Date-times: the spec text exactly as written, typed
// as a branded string that is a plain string at runtime, and pure functions
// converting it. This module is pure.
import { z } from "zod";

import { assertCondition } from "./assert.js";

declare const dateTimeBrand: unique symbol;

/** An ISO 8601 date-time with an offset, as written in the playlist. */
export type DateTime = string & { readonly [dateTimeBrand]: true };

// One token per field, so each field's range is checked below rather than by the pattern.
const DATE_TIME_PATTERN =
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.\d+)?(?:Z|[+-](?<offsetHour>\d{2}):?(?<offsetMinute>\d{2}))$/;
const MONTH_FIRST = 1;
const MONTH_LAST = 12;
const DAY_FIRST = 1;
const HOUR_LAST = 23;
const MINUTE_LAST = 59;
const SECOND_LAST = 59;
const OFFSET_HOUR_LAST = 23;

function daysInMonth(date: { readonly year: number; readonly month: number }) {
    // Day 0 of the next month is the last day of this one, and months count from 0.
    // setUTCFullYear takes the year as written, where Date.UTC reads 0 to 99 as 1900 to 1999.
    const lastDay = new Date(0);
    lastDay.setUTCFullYear(date.year, date.month, 0);
    return lastDay.getUTCDate();
}

type FieldRange = { readonly text: string | undefined; readonly first: number; readonly last: number };

/** Whether a field is in its range; a field the text leaves out, an offset after 'Z', has none to break. */
function isWithin(range: FieldRange) {
    if (range.text === undefined) {
        return true;
    }
    const value = Number(range.text);
    const isAboveFirst = value >= range.first;
    return isAboveFirst && value <= range.last;
}

/** Whether `value` is an ISO 8601 date-time with an offset, each field in its range. */
export function isDateTime(value: string): value is DateTime {
    const match = DATE_TIME_PATTERN.exec(value);
    if (match === null) {
        return false;
    }
    const fields = match.groups;
    assertCondition(fields !== undefined, "The date-time pattern has named groups.");
    const year = Number(fields["year"]);
    const month = Number(fields["month"]);
    const isMonthValid = isWithin({ text: fields["month"], first: MONTH_FIRST, last: MONTH_LAST });
    if (!isMonthValid) {
        return false;
    }
    const dayLast = daysInMonth({ year, month });
    const ranges: readonly FieldRange[] = [
        { text: fields["day"], first: DAY_FIRST, last: dayLast },
        { text: fields["hour"], first: 0, last: HOUR_LAST },
        { text: fields["minute"], first: 0, last: MINUTE_LAST },
        { text: fields["second"], first: 0, last: SECOND_LAST },
        { text: fields["offsetHour"], first: 0, last: OFFSET_HOUR_LAST },
        { text: fields["offsetMinute"], first: 0, last: MINUTE_LAST },
    ];
    for (const range of ranges) {
        if (!isWithin(range)) {
            return false;
        }
    }
    return true;
}

function toDateTime(value: string, context: z.core.$RefinementCtx<string>) {
    if (isDateTime(value)) {
        return value;
    }
    context.addIssue({ code: "custom", message: `${JSON.stringify(value)} is not an ISO 8601 date-time with an offset.` });
    return z.NEVER;
}

/** Validates an ISO 8601 date-time with an offset, keeping the text as written. */
export const dateTimeSchema = z.string().transform(toDateTime);

/** Converts a date-time to its milliseconds since the Unix epoch. */
export function toEpochMilliseconds(value: DateTime) {
    const epochMilliseconds = Date.parse(value);
    assertCondition(Number.isFinite(epochMilliseconds), `Validated date-time ${value} does not parse.`);
    return epochMilliseconds;
}

/** Converts a date-time to a new Date, which the caller owns. */
export function toDate(value: DateTime) {
    const epochMilliseconds = toEpochMilliseconds(value);
    return new Date(epochMilliseconds);
}

/** The part of the Temporal namespace toInstant uses, native or a caller-supplied polyfill. */
export type TemporalNamespace<Instant> = { readonly Instant: { readonly from: (item: string) => Instant } };

/** Converts a date-time to an Instant of the given Temporal namespace. */
export function toInstant<Instant>(value: DateTime, temporal: TemporalNamespace<Instant>) {
    return temporal.Instant.from(value);
}
