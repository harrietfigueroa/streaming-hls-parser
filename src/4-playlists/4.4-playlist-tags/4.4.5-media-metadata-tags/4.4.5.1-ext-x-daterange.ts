// Section 4.4.5.1, EXT-X-DATERANGE. This module is pure: it declares the tag's
// rules and attribute table, keeps X- attributes as typed values, and checks
// the rules that span a playlist's Date Ranges.
import { z } from "zod";

import {
    attributeListTagSchema,
    decimalFloatingPointSchema,
    enumeratedStringListSchema,
    enumeratedStringSchema,
    hexadecimalSequenceSchema,
    quotedStringSchema,
    signedDecimalFloatingPointSchema,
} from "../../4.2-attribute-lists.js";
import { type DateTime, dateTimeSchema, toEpochMilliseconds } from "../../../library/date-time.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";
import type { IgnoreReason } from "../../../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";

const SECTION = "4.4.5.1";

export const EXT_X_DATERANGE_TAG_NAME = "EXT-X-DATERANGE";

export const extXDateRangeRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-DATERANGE's attributes have the types section 4.4.5.1 defines, with a quoted-string ID.",
    },
    startDateRequired: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Date Range has a START-DATE, or follows a Date Range with its ID that has one.",
    },
    endAfterStart: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Date Range's END-DATE is equal to or later than its START-DATE.",
    },
    cueExclusive: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A CUE attribute does not include both PRE and POST.",
    },
    endOnNextClass: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-DATERANGE tag with END-ON-NEXT=YES has a CLASS attribute.",
    },
    endOnNextAlone: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-DATERANGE tag with END-ON-NEXT=YES has no DURATION or END-DATE.",
    },
    programDateTimeRequired: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist containing an EXT-X-DATERANGE tag contains at least one EXT-X-PROGRAM-DATE-TIME tag.",
    },
    consistentRepeats: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Two EXT-X-DATERANGE tags with the same ID give any AttributeName in both the same AttributeValue.",
    },
    durationMatchesEnd: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Date Range with both DURATION and END-DATE has an END-DATE equal to its START-DATE plus its DURATION.",
    },
} as const satisfies Record<string, Rule>;

/** Section 4.4.5.1's instruction to ignore an EXT-X-DATERANGE tag with illegal syntax. */
export const extXDateRangeIgnoreReason = {
    section: SECTION,
    requirement: "A client ignores an EXT-X-DATERANGE tag with illegal syntax.",
} as const satisfies IgnoreReason;

export const Cue = { pre: "PRE", post: "POST", once: "ONCE" } as const;
export type Cue = (typeof Cue)[keyof typeof Cue];

const YES = "YES";
const CLIENT_ATTRIBUTE_PREFIX = "X-";
const quotedDateTimeSchema = quotedStringSchema.pipe(dateTimeSchema);

/** An X- attribute's value: a quoted-string unquoted, a hexadecimal-sequence as written, or a number. */
const clientAttributeValueSchema = z.union([quotedStringSchema, hexadecimalSequenceSchema, signedDecimalFloatingPointSchema]);

const dateRangeAttributesSchema = attributeListTagSchema({
    ID: quotedStringSchema,
    CLASS: quotedStringSchema.optional(),
    "START-DATE": quotedDateTimeSchema.optional(),
    CUE: enumeratedStringListSchema([Cue.pre, Cue.post, Cue.once]).optional(),
    "END-DATE": quotedDateTimeSchema.optional(),
    DURATION: decimalFloatingPointSchema.optional(),
    "PLANNED-DURATION": decimalFloatingPointSchema.optional(),
    "SCTE35-CMD": hexadecimalSequenceSchema.optional(),
    "SCTE35-OUT": hexadecimalSequenceSchema.optional(),
    "SCTE35-IN": hexadecimalSequenceSchema.optional(),
    "END-ON-NEXT": enumeratedStringSchema([YES]).optional(),
});

const splitSchema = z
    .object({
        attributes: dateRangeAttributesSchema,
        clientAttributes: z.record(z.string(), clientAttributeValueSchema).readonly().optional(),
    })
    .readonly();

type SplitInput = z.input<typeof splitSchema>;

function splitClientAttributes(attributes: Readonly<Record<string, string>>) {
    const defined: Record<string, string> = {};
    const client: Record<string, string> = {};
    let hasClientAttributes = false;
    for (const [name, value] of Object.entries(attributes)) {
        if (name.startsWith(CLIENT_ATTRIBUTE_PREFIX)) {
            client[name] = value;
            hasClientAttributes = true;
        } else {
            defined[name] = value;
        }
    }
    if (hasClientAttributes) {
        const withClient: SplitInput = { attributes: defined, clientAttributes: client };
        return withClient;
    }
    const definedOnly: SplitInput = { attributes: defined };
    return definedOnly;
}

function joinClientAttributes(split: z.output<typeof splitSchema>) {
    if (split.clientAttributes === undefined) {
        return split.attributes;
    }
    return Object.freeze({ ...split.attributes, clientAttributes: split.clientAttributes });
}

/**
 * Converts EXT-X-DATERANGE's attributes, each optional one absent when not written. X- attributes,
 * which section 4.4.5.1 defines as a namespace, are kept in a frozen clientAttributes object keyed by
 * their names, absent when there are none.
 */
export const extXDateRangeSchema = z.preprocess(splitClientAttributes, splitSchema).transform(joinClientAttributes);

type DateRange = {
    readonly ID: string;
    readonly CLASS?: string | undefined;
    readonly "START-DATE"?: DateTime | undefined;
    readonly CUE?: readonly string[] | undefined;
    readonly "END-DATE"?: DateTime | undefined;
    readonly DURATION?: number | undefined;
    readonly "END-ON-NEXT"?: string | undefined;
    readonly clientAttributes?: Readonly<Record<string, string | number>> | undefined;
};

const MILLISECONDS_PER_SECOND = 1000;
// Library-added keys: the tag's own unrecognized attributes, and its X- attributes, compared one by one.
const IGNORED_KEY = "ignored";
const CLIENT_ATTRIBUTES_KEY = "clientAttributes";

function attributeText(value: unknown) {
    if (Array.isArray(value)) {
        return value.join(",");
    }
    return String(value);
}

/** Yields each attribute a Date Range was written with, by AttributeName, its value as comparable text. */
function* attributeEntries(dateRange: DateRange) {
    for (const [name, value] of Object.entries(dateRange)) {
        const isLibraryKey = name === IGNORED_KEY || name === CLIENT_ATTRIBUTES_KEY;
        if (!isLibraryKey) {
            const text = attributeText(value);
            yield [name, text] as const;
        }
    }
    const clientAttributes = dateRange.clientAttributes;
    if (clientAttributes === undefined) {
        return;
    }
    for (const [name, value] of Object.entries(clientAttributes)) {
        const text = attributeText(value);
        yield [name, text] as const;
    }
}

/** Checks one Date Range on its own, given the START-DATE it has or inherits by ID. */
function checkDateRange(options: { readonly dateRange: DateRange; readonly startDate: DateTime | undefined }) {
    const { dateRange, startDate } = options;
    const issues: Issue[] = [];
    const where = `Date Range ${dateRange.ID}`;
    const endDate = dateRange["END-DATE"];
    if (startDate === undefined) {
        issues.push({ rule: extXDateRangeRules.startDateRequired, detail: `${where} has no START-DATE.` });
    } else if (endDate !== undefined) {
        const startMilliseconds = toEpochMilliseconds(startDate);
        const endMilliseconds = toEpochMilliseconds(endDate);
        if (endMilliseconds < startMilliseconds) {
            issues.push({ rule: extXDateRangeRules.endAfterStart, detail: `${where} ends before it starts.` });
        }
        const duration = dateRange.DURATION;
        if (duration !== undefined) {
            const durationMilliseconds = Math.round(duration * MILLISECONDS_PER_SECOND);
            const isMatching = startMilliseconds + durationMilliseconds === endMilliseconds;
            if (!isMatching) {
                issues.push({ rule: extXDateRangeRules.durationMatchesEnd, detail: `${where}'s END-DATE is not START-DATE plus DURATION.` });
            }
        }
    }
    const cue = dateRange.CUE;
    if (cue !== undefined) {
        const hasPre = cue.includes(Cue.pre);
        const hasBoth = hasPre && cue.includes(Cue.post);
        if (hasBoth) {
            issues.push({ rule: extXDateRangeRules.cueExclusive, detail: `${where}'s CUE has PRE and POST.` });
        }
    }
    if (dateRange["END-ON-NEXT"] !== undefined) {
        if (dateRange.CLASS === undefined) {
            issues.push({ rule: extXDateRangeRules.endOnNextClass, detail: `${where} has END-ON-NEXT and no CLASS.` });
        }
        const hasEnd = dateRange.DURATION !== undefined || endDate !== undefined;
        if (hasEnd) {
            issues.push({ rule: extXDateRangeRules.endOnNextAlone, detail: `${where} has END-ON-NEXT and a DURATION or END-DATE.` });
        }
    }
    return issues;
}

/** Checks a Date Range against every attribute earlier tags with its ID gave, which `seen` holds by AttributeName. */
function checkRepeat(dateRange: DateRange, seen: ReadonlyMap<string, string>) {
    const issues: Issue[] = [];
    for (const [name, text] of attributeEntries(dateRange)) {
        const earlierText = seen.get(name);
        const isChanged = earlierText !== undefined && earlierText !== text;
        if (isChanged) {
            issues.push({ rule: extXDateRangeRules.consistentRepeats, detail: `Date Range ${dateRange.ID} changes ${name}.` });
        }
    }
    return issues;
}

/**
 * Checks the rules that span a playlist's Date Ranges, in the order they are written: START-DATE
 * inheritance by ID, consistent repeats, and the program date-time they need. Whether ranges of one
 * CLASS overlap is not checked here.
 */
export function checkDateRanges(options: { readonly dateRanges: readonly DateRange[]; readonly hasProgramDateTime: boolean }) {
    const { dateRanges, hasProgramDateTime } = options;
    const issues: Issue[] = [];
    if (dateRanges.length === 0) {
        return issues;
    }
    if (!hasProgramDateTime) {
        const detail = "The playlist has EXT-X-DATERANGE and no EXT-X-PROGRAM-DATE-TIME.";
        issues.push({ rule: extXDateRangeRules.programDateTimeRequired, detail });
    }
    const attributesById = new Map<string, Map<string, string>>();
    const startById = new Map<string, DateTime>();
    for (const dateRange of dateRanges) {
        let seen = attributesById.get(dateRange.ID);
        if (seen === undefined) {
            seen = new Map();
            attributesById.set(dateRange.ID, seen);
        }
        const repeatIssues = checkRepeat(dateRange, seen);
        for (const issue of repeatIssues) {
            issues.push(issue);
        }
        for (const [name, text] of attributeEntries(dateRange)) {
            if (!seen.has(name)) {
                seen.set(name, text);
            }
        }
        let startDate = startById.get(dateRange.ID);
        const ownStart = dateRange["START-DATE"];
        if (ownStart !== undefined) {
            startDate = ownStart;
            startById.set(dateRange.ID, ownStart);
        }
        const rangeIssues = checkDateRange({ dateRange, startDate });
        for (const issue of rangeIssues) {
            issues.push(issue);
        }
    }
    return issues;
}
