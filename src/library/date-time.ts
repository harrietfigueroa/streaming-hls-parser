// Date-times: the spec text exactly as written, typed
// as a branded string that is a plain string at runtime, and pure functions
// converting it. This module is pure.
import { z } from "zod";

import { assertCondition } from "./assert.js";

declare const dateTimeBrand: unique symbol;

/** An ISO 8601 date-time with an offset, as written in the playlist. */
export type DateTime = string & { readonly [dateTimeBrand]: true };

// The fixed-width head every date-time begins with: each DIGIT_PLACEHOLDER is a
// digit, and every other character stands for itself.
const HEAD_LAYOUT = "dddd-dd-ddTdd:dd:dd";
const DIGIT_PLACEHOLDER = "d";
const YEAR_INDEX = 0;
const MONTH_INDEX = 5;
const DAY_INDEX = 8;
const HOUR_INDEX = 11;
const MINUTE_INDEX = 14;
const SECOND_INDEX = 17;
const FRACTION_SEPARATOR = ".";
const UTC_DESIGNATOR = "Z";
const OFFSET_PLUS = "+";
const OFFSET_MINUS = "-";
const OFFSET_SEPARATOR = ":";
const FIELD_LENGTH = 2;
const YEAR_LENGTH = 4;
const ZERO_CODE = 0x30;
const NINE_CODE = 0x39;
const DECIMAL_BASE = 10;
const MONTH_FIRST = 1;
const MONTH_LAST = 12;
const DAY_FIRST = 1;
const HOUR_LAST = 23;
const MINUTE_LAST = 59;
const SECOND_LAST = 59;
const OFFSET_HOUR_LAST = 23;
const FEBRUARY = 2;
const FEBRUARY_COMMON_DAYS = 28;
const FEBRUARY_LEAP_DAYS = 29;
const SHORT_MONTH_DAYS = 30;
const LONG_MONTH_DAYS = 31;
const LEAP_YEAR_INTERVAL = 4;
const CENTURY_YEARS = 100;
const QUADRICENTENNIAL_YEARS = 400;
// Days in each month of a common year, January first.
const commonYearMonthDays = [
    LONG_MONTH_DAYS,
    FEBRUARY_COMMON_DAYS,
    LONG_MONTH_DAYS,
    SHORT_MONTH_DAYS,
    LONG_MONTH_DAYS,
    SHORT_MONTH_DAYS,
    LONG_MONTH_DAYS,
    LONG_MONTH_DAYS,
    SHORT_MONTH_DAYS,
    LONG_MONTH_DAYS,
    SHORT_MONTH_DAYS,
    LONG_MONTH_DAYS,
] as const;

/** Whether `value` is an ISO 8601 date-time with an offset, each field in its range. */
export function isDateTime(value: string): value is DateTime {
    const hasHead = matchesHead(value);
    if (!hasHead) {
        return false;
    }
    const month = readDigits(value, { start: MONTH_INDEX, length: FIELD_LENGTH });
    const isMonthValid = month >= MONTH_FIRST && month <= MONTH_LAST;
    if (!isMonthValid) {
        return false;
    }
    const year = readDigits(value, { start: YEAR_INDEX, length: YEAR_LENGTH });
    const day = readDigits(value, { start: DAY_INDEX, length: FIELD_LENGTH });
    const dayLast = daysInMonth({ year, month });
    const isDayValid = day >= DAY_FIRST && day <= dayLast;
    if (!isDayValid) {
        return false;
    }
    const hour = readDigits(value, { start: HOUR_INDEX, length: FIELD_LENGTH });
    const minute = readDigits(value, { start: MINUTE_INDEX, length: FIELD_LENGTH });
    const second = readDigits(value, { start: SECOND_INDEX, length: FIELD_LENGTH });
    const isHourValid = hour <= HOUR_LAST;
    const isMinuteValid = minute <= MINUTE_LAST;
    const isSecondValid = second <= SECOND_LAST;
    const isHourMinuteValid = isHourValid && isMinuteValid;
    const isTimeValid = isHourMinuteValid && isSecondValid;
    if (!isTimeValid) {
        return false;
    }
    const zoneIndex = findZoneIndex(value);
    return isZoneAt(value, zoneIndex);
}

function isDigitAt(value: string, index: number) {
    // Past the end, charCodeAt returns NaN, which fails both comparisons.
    const code = value.charCodeAt(index);
    return code >= ZERO_CODE && code <= NINE_CODE;
}

/** Reads a run of digits the caller has checked as a decimal number. */
function readDigits(value: string, run: { readonly start: number; readonly length: number }) {
    let number = 0;
    const end = run.start + run.length;
    for (let index = run.start; index < end; index += 1) {
        const digit = value.charCodeAt(index) - ZERO_CODE;
        number = number * DECIMAL_BASE + digit;
    }
    return number;
}

function matchesHead(value: string) {
    const isLongEnough = value.length >= HEAD_LAYOUT.length;
    if (!isLongEnough) {
        return false;
    }
    for (let index = 0; index < HEAD_LAYOUT.length; index += 1) {
        const expected = HEAD_LAYOUT[index];
        if (expected === DIGIT_PLACEHOLDER) {
            const isDigit = isDigitAt(value, index);
            if (!isDigit) {
                return false;
            }
            continue;
        }
        const isLiteral = value[index] === expected;
        if (!isLiteral) {
            return false;
        }
    }
    return true;
}

/** The index the zone begins at, past the head and any fraction of a second. */
function findZoneIndex(value: string) {
    const fractionIndex = HEAD_LAYOUT.length;
    const hasFraction = value[fractionIndex] === FRACTION_SEPARATOR;
    if (!hasFraction) {
        return fractionIndex;
    }
    const digitsIndex = fractionIndex + 1;
    let index = digitsIndex;
    for (; index < value.length; index += 1) {
        const isDigit = isDigitAt(value, index);
        if (!isDigit) {
            break;
        }
    }
    // A separator with no digits after it is not a fraction, and no zone begins with one.
    if (index === digitsIndex) {
        return fractionIndex;
    }
    return index;
}

/** Whether the rest of `value` from `index` is exactly 'Z' or an offset of hours and minutes in range. */
function isZoneAt(value: string, index: number) {
    const sign = value[index];
    if (sign === UTC_DESIGNATOR) {
        return value.length === index + 1;
    }
    const isSign = sign === OFFSET_PLUS || sign === OFFSET_MINUS;
    if (!isSign) {
        return false;
    }
    const hourIndex = index + 1;
    const separatorIndex = hourIndex + FIELD_LENGTH;
    let minuteIndex = separatorIndex;
    if (value[separatorIndex] === OFFSET_SEPARATOR) {
        minuteIndex += 1;
    }
    const zoneEnd = minuteIndex + FIELD_LENGTH;
    const isZoneLength = value.length === zoneEnd;
    if (!isZoneLength) {
        return false;
    }
    const areHourDigits = isDigitAt(value, hourIndex) && isDigitAt(value, hourIndex + 1);
    const areMinuteDigits = isDigitAt(value, minuteIndex) && isDigitAt(value, minuteIndex + 1);
    const areDigits = areHourDigits && areMinuteDigits;
    if (!areDigits) {
        return false;
    }
    const offsetHour = readDigits(value, { start: hourIndex, length: FIELD_LENGTH });
    const offsetMinute = readDigits(value, { start: minuteIndex, length: FIELD_LENGTH });
    const isOffsetHourValid = offsetHour <= OFFSET_HOUR_LAST;
    return isOffsetHourValid && offsetMinute <= MINUTE_LAST;
}

/** Whether `year` is a leap year of the proleptic Gregorian calendar, year 0000 included. */
function isLeapYear(year: number) {
    const isQuadrennial = year % LEAP_YEAR_INTERVAL === 0;
    const isCentury = year % CENTURY_YEARS === 0;
    const isQuadricentennial = year % QUADRICENTENNIAL_YEARS === 0;
    const passesCenturyRule = !isCentury || isQuadricentennial;
    return isQuadrennial && passesCenturyRule;
}

function daysInMonth(date: { readonly year: number; readonly month: number }) {
    const isFebruary = date.month === FEBRUARY;
    const isLeapFebruary = isFebruary && isLeapYear(date.year);
    if (isLeapFebruary) {
        return FEBRUARY_LEAP_DAYS;
    }
    const days = commonYearMonthDays[date.month - 1];
    assertCondition(days !== undefined, `Month ${date.month} has no day count.`);
    return days;
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
