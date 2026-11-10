// The streaming parse. It reads a chunk stream's lines into the line-fed
// scanner, converts each unit and each playlist tag alone as the scanner
// reports it, and yields it at once as the same output object the static parse
// builds, keeping only the playlist's tags and the few facts per unit that the
// spanning rules read. Those rules run once the last line is read.
import type { z } from "zod";

import { assertCondition, unreachable } from "./assert.js";
import { createMediaPlaylistChecker, findMultivariantPlaylistIssues } from "./check-playlist.js";
import { Limit } from "./options.js";
import {
    createPlaylistTag,
    createUnit,
    type MediaSegment,
    type PendingSegment,
    type PlaylistTag,
    type Variant,
} from "./output.js";
import { LineReadKind, readLines } from "./read-lines.js";
import { createSegmentResolver } from "./resolve.js";
import { type Issue, Severity } from "./rule.js";
import {
    createScanner,
    IgnoredKind,
    type IgnoredLine,
    type RawPlaylist,
    type RawPlaylistHead,
    type RawTag,
    type RawUnit,
    type RawUriUnit,
    type ScannerOptions,
    ScanKind,
    ScanStepKind,
} from "./scan.js";
import {
    classifySchemaIssue,
    type IgnorableTag,
    SchemaIssueKind,
    UNITS_KEYS,
    UnitIgnoreKind,
    withIgnoredUnitTags,
} from "./schema-issues.js";
import { type Schemas, toTagValues } from "./schemas.js";
import { OccurrenceKind, PlaylistKind, type TagEntry, type TagTables } from "./tag-table.js";

export const StreamPartKind = {
    playlistTag: "playlistTag",
    segment: "segment",
    pendingSegment: "pendingSegment",
    variant: "variant",
    end: "end",
    malformed: "malformed",
    limitExceeded: "limitExceeded",
} as const;
export type StreamPartKind = (typeof StreamPartKind)[keyof typeof StreamPartKind];

/** The output objects a stream's parts carry, which a reviver replaces with its returns. */
type PartObjects = {
    readonly playlistTag: unknown;
    readonly segment: unknown;
    readonly pendingSegment: unknown;
    readonly variant: unknown;
};

type StreamPartPayloads<Objects extends PartObjects> = {
    [StreamPartKind.playlistTag]: { readonly playlistTag: Objects["playlistTag"] };
    [StreamPartKind.segment]: { readonly segment: Objects["segment"] };
    [StreamPartKind.pendingSegment]: { readonly pendingSegment: Objects["pendingSegment"] };
    [StreamPartKind.variant]: { readonly variant: Objects["variant"] };
    /** The last part of a stream that parsed. */
    [StreamPartKind.end]: {
        readonly playlistKind: PlaylistKind;
        /** The playlist's own ignored lines, after its last unit. */
        readonly ignored: readonly IgnoredLine[];
        /** The playlist's text after the last part's. */
        readonly text: string;
        /** Each Variable Name the playlist's definitions provide, with its resolved Variable Value. */
        readonly variables: ReadonlyMap<string, string>;
        readonly violations: readonly Issue[];
    };
    [StreamPartKind.malformed]: { readonly issues: readonly Issue[] };
    [StreamPartKind.limitExceeded]: { readonly limit: Limit; readonly value: number };
};
type StreamPartMember<Objects extends PartObjects, K extends StreamPartKind> = { readonly kind: K } & StreamPartPayloads<Objects>[K];
type StreamPartOf<Objects extends PartObjects> = { [K in StreamPartKind]: StreamPartMember<Objects, K> }[StreamPartKind];

/** One part a streaming HLS.safeParse yields, keyed by kind; the last is end, malformed, or limitExceeded. */
export type StreamPart = StreamPartOf<{
    readonly playlistTag: PlaylistTag;
    readonly segment: MediaSegment;
    readonly pendingSegment: PendingSegment;
    readonly variant: Variant;
}>;

/** A part of a stream parsed with a reviver, whose output objects are the reviver's returns. */
export type RevivedStreamPart = StreamPartOf<{
    readonly playlistTag: unknown;
    readonly segment: unknown;
    readonly pendingSegment: unknown;
    readonly variant: unknown;
}>;

/** What a stream's parse runs over: the HLS namespace's tables, schemas, and scan options. */
export type StreamContext = {
    readonly tables: TagTables;
    readonly schemas: Schemas;
    readonly scannerOptions: ScannerOptions;
};

const ConversionKind = { converted: "converted", ignored: "ignored", malformed: "malformed" } as const;
type ConversionKind = (typeof ConversionKind)[keyof typeof ConversionKind];

type ConversionPayloads<Value> = {
    [ConversionKind.converted]: { readonly value: Value };
    /** Every issue names a tag section 6.3.1 ignores. */
    [ConversionKind.ignored]: { readonly ignorables: readonly IgnorableTag[] };
    [ConversionKind.malformed]: { readonly issues: readonly Issue[] };
};
type ConversionMember<Value, K extends ConversionKind> = { readonly kind: K } & ConversionPayloads<Value>[K];
type Conversion<Value> = { [K in ConversionKind]: ConversionMember<Value, K> }[ConversionKind];

// A unit has no text range of its own in a view built to classify one of its issues, and the
// playlist around one unit or tag has no other content.
const NO_TAGS = new Map<string, RawTag[]>();
const NO_UNITS: readonly RawUriUnit[] = Object.freeze([]);
const NO_LINES: readonly IgnoredLine[] = Object.freeze([]);
const NO_VARIABLES: ReadonlyMap<string, string> = new Map();
const NO_FIELDS = Object.freeze({});
const PENDING_SEGMENT_KEY = "pendingSegment";

function malformedPart(issues: readonly Issue[]) {
    const malformed: StreamPart = { kind: StreamPartKind.malformed, issues };
    return malformed;
}

function limitExceededPart(limit: Limit, value: number) {
    const exceeded: StreamPart = { kind: StreamPartKind.limitExceeded, limit, value };
    return exceeded;
}

/**
 * Classifies a failed conversion's issues against `view`, a playlist holding only what was converted,
 * each issue's path led by `prefix`, where that sits in a whole playlist.
 */
function classify(options: {
    readonly issues: readonly z.core.$ZodIssue[];
    readonly view: RawPlaylist;
    readonly prefix: readonly PropertyKey[];
    readonly scannerOptions: ScannerOptions;
}) {
    const { view, prefix, scannerOptions } = options;
    const broken: Issue[] = [];
    const ignorables: IgnorableTag[] = [];
    const ignoredTags = new Set<RawTag>();
    for (const issue of options.issues) {
        const path = [...prefix, ...issue.path];
        const located = { ...issue, path };
        const schemaIssue = classifySchemaIssue({ issue: located, playlist: view, entries: scannerOptions.entries });
        if (schemaIssue.kind === SchemaIssueKind.broken) {
            broken.push(schemaIssue.issue);
        } else if (!ignoredTags.has(schemaIssue.ignorable.tag)) {
            ignoredTags.add(schemaIssue.ignorable.tag);
            ignorables.push(schemaIssue.ignorable);
        }
    }
    if (broken.length > 0) {
        const malformed: Conversion<never> = { kind: ConversionKind.malformed, issues: broken };
        return malformed;
    }
    const ignored: Conversion<never> = { kind: ConversionKind.ignored, ignorables };
    return ignored;
}

/** A playlist holding `parts` alone, for classifying the issues of converting them. */
function viewOf(parts: { readonly kind: PlaylistKind } & Partial<RawPlaylist>) {
    const view: RawPlaylist = {
        tags: NO_TAGS,
        units: NO_UNITS,
        ignored: NO_LINES,
        variables: NO_VARIABLES,
        source: "",
        ...parts,
    };
    return view;
}

/** The text a stream has read and not yet yielded, which starts where the last yielded part's text ends. */
function createTextBuffer() {
    let text = "";
    let start = 0;

    function append(lineText: string) {
        text += lineText;
    }

    /** Takes the text through `end`, a position in the whole stream's text. */
    function take(end: number) {
        assertCondition(end >= start, `Text through ${end} was taken after text through ${start}.`);
        const length = end - start;
        const taken = text.slice(0, length);
        text = text.slice(length);
        start = end;
        return taken;
    }

    function rest() {
        const remaining = text;
        text = "";
        return remaining;
    }

    return { append, take, rest };
}

/** The playlist tag's schema in its kind's table; a tag of both kinds has the same schema in each. */
function playlistTagSchemaOf(options: { readonly tables: TagTables; readonly name: string }) {
    const { tables, name } = options;
    const mediaShape: Readonly<Record<string, z.ZodType>> = tables.media.playlist.shape;
    const multivariantShape: Readonly<Record<string, z.ZodType>> = tables.multivariant.playlist.shape;
    if (Object.hasOwn(mediaShape, name)) {
        const schema = mediaShape[name];
        assertCondition(schema !== undefined, `Playlist tag ${name} has no media schema.`);
        return schema;
    }
    const schema = multivariantShape[name];
    assertCondition(schema !== undefined, `Playlist tag ${name} has no schema.`);
    return schema;
}

const UnitConversionKind = { converted: "converted", dropped: "dropped", malformed: "malformed" } as const;
type UnitConversionKind = (typeof UnitConversionKind)[keyof typeof UnitConversionKind];

type UnitConversionPayloads<Value> = {
    [UnitConversionKind.converted]: { readonly value: Value };
    /** The unit's ignored tag ignores its URI line too, and these lines lead the next unit's. */
    [UnitConversionKind.dropped]: { readonly lines: readonly IgnoredLine[] };
    [UnitConversionKind.malformed]: { readonly issues: readonly Issue[] };
};
type UnitConversionMember<Value, K extends UnitConversionKind> = { readonly kind: K } & UnitConversionPayloads<Value>[K];
type UnitConversion<Value> = { [K in UnitConversionKind]: UnitConversionMember<Value, K> }[UnitConversionKind];

const NO_PARTS: readonly StreamPart[] = Object.freeze([]);

function isSequenceTag(name: string) {
    return name === "EXT-X-MEDIA-SEQUENCE" || name === "EXT-X-DISCONTINUITY-SEQUENCE";
}

function joinLines<Element>(options: { readonly leading: readonly Element[]; readonly trailing: readonly Element[] }) {
    const joined = Array.from(options.leading);
    for (const line of options.trailing) {
        joined.push(line);
    }
    return joined;
}

/** Resolves each issue through `policy`, into the malformed ones and the violations. */
function partitionIssues(options: { readonly issues: readonly Issue[]; readonly policy: ScannerOptions["policy"] }) {
    const malformed: Issue[] = [];
    const violations: Issue[] = [];
    for (const issue of options.issues) {
        if (options.policy(issue.rule) === Severity.malformed) {
            malformed.push(issue);
        } else {
            violations.push(issue);
        }
    }
    return { malformed, violations };
}

/**
 * Creates the state of one streaming parse. Each line read goes to `scanLine`, and `finish` follows
 * the last; each returns the parts it completes, in order, and a malformed or limitExceeded part is
 * the last part of all.
 */
function createStreamSession(context: StreamContext) {
    const { tables, schemas, scannerOptions } = context;
    const { entries, policy } = scannerOptions;
    const scanner = createScanner(scannerOptions);
    const buffer = createTextBuffer();
    const checker = createMediaPlaylistChecker();
    const streamInfs: z.output<Schemas["variantSchema"]>["EXT-X-STREAM-INF"][] = [];
    const sequenceValues: Record<string, unknown> = {};
    let resolver: ReturnType<typeof createSegmentResolver> | undefined;
    // Counts every unit the scan completed, a dropped one included, as the static parse numbers them.
    let unitIndex = 0;
    // The lines of dropped units, which lead the next unit's ignored lines, as their text leads its text.
    let carried: readonly IgnoredLine[] = NO_LINES;

    // A segment's sequence numbers start from tags that precede every segment, so the first segment fixes them.
    function resolverOf() {
        if (resolver === undefined) {
            const sequenceTags = schemas.sequenceTagsSchema.safeParse(sequenceValues);
            assertCondition(sequenceTags.success, "The sequence tags failed their schemas after each passed alone.");
            resolver = createSegmentResolver(sequenceTags.data);
        }
        return resolver;
    }

    function convertPlaylistTag(step: { readonly name: string; readonly entry: TagEntry; readonly tag: RawTag }) {
        const { name, entry, tag } = step;
        const schema = playlistTagSchemaOf({ tables, name });
        const isRepeated = entry.occurrence.kind === OccurrenceKind.repeated;
        let input: unknown = tag.value;
        if (isRepeated) {
            input = [tag.value];
        }
        const result = schema.safeParse(input);
        if (result.success) {
            let value: unknown = result.data;
            if (isRepeated) {
                assertCondition(Array.isArray(result.data), `Repeated tag ${name} converted to no array.`);
                value = result.data[0];
            }
            const converted: Conversion<unknown> = { kind: ConversionKind.converted, value };
            return converted;
        }
        const view = viewOf({ kind: scanner.playlistKind(), tags: new Map([[name, [tag]]]) });
        return classify({ issues: result.error.issues, view, prefix: [name], scannerOptions });
    }

    /** The parts of a kept playlist tag: its own part, none when the conversion ignores it, or the malformed part. */
    function playlistTagParts(step: { readonly name: string; readonly entry: TagEntry; readonly tag: RawTag }) {
        const conversion = convertPlaylistTag(step);
        if (conversion.kind === ConversionKind.malformed) {
            return [malformedPart(conversion.issues)];
        }
        if (conversion.kind === ConversionKind.ignored) {
            const [ignorable] = conversion.ignorables;
            assertCondition(ignorable !== undefined, `${step.name} is ignored for no reason.`);
            scanner.ignorePlaylistTag({ name: step.name, tag: step.tag, reason: ignorable.reason });
            return NO_PARTS;
        }
        if (isSequenceTag(step.name)) {
            sequenceValues[step.name] = step.tag.value;
        }
        let text = "";
        if (step.tag.range.start < step.tag.range.end) {
            text = buffer.take(step.tag.range.end);
        }
        const playlistTag = createPlaylistTag({ name: step.name, value: conversion.value, text });
        const part: StreamPart = { kind: StreamPartKind.playlistTag, playlistTag };
        return [part];
    }

    /**
     * Converts one unit with `schema`, the carried lines leading its ignored lines; a unit with tags
     * section 6.3.1 ignores converts again without them, or is dropped when one ignores its URI line.
     */
    function convertUnit<Schema extends z.ZodType>(options: {
        readonly schema: Schema;
        readonly unit: RawUnit & { readonly uri?: string; readonly uriLine?: string };
        /** Where the unit sits in a whole playlist: its units key and index, or the pending segment's key. */
        readonly prefix: readonly PropertyKey[];
        readonly view: RawPlaylist;
        readonly toInput: (unit: RawUnit) => unknown;
    }) {
        const { schema, unit, prefix, view, toInput } = options;
        const withCarried = { tags: unit.tags, ignored: joinLines({ leading: carried, trailing: unit.ignored }) };
        const first = schema.safeParse(toInput(withCarried));
        if (first.success) {
            const converted: UnitConversion<z.output<Schema>> = { kind: UnitConversionKind.converted, value: first.data };
            return converted;
        }
        const classified = classify({ issues: first.error.issues, view, prefix, scannerOptions });
        if (classified.kind === ConversionKind.malformed) {
            const malformed: UnitConversion<z.output<Schema>> = { kind: UnitConversionKind.malformed, issues: classified.issues };
            return malformed;
        }
        const ignore = withIgnoredUnitTags({ unit, ignorables: classified.ignorables });
        if (ignore.kind === UnitIgnoreKind.dropped) {
            assertCondition(unit.uriLine !== undefined, "A unit without a URI line was dropped.");
            const lines = joinLines({ leading: carried, trailing: ignore.ignored });
            lines.push({ kind: IgnoredKind.ignoredUri, line: unit.uriLine, reason: ignore.reason });
            const dropped: UnitConversion<z.output<Schema>> = { kind: UnitConversionKind.dropped, lines };
            return dropped;
        }
        const rebuilt = { tags: ignore.tags, ignored: joinLines({ leading: carried, trailing: ignore.ignored }) };
        const second = schema.safeParse(toInput(rebuilt));
        if (second.success) {
            const converted: UnitConversion<z.output<Schema>> = { kind: UnitConversionKind.converted, value: second.data };
            return converted;
        }
        const reclassified = classify({ issues: second.error.issues, view, prefix, scannerOptions });
        assertCondition(reclassified.kind === ConversionKind.malformed, "A tag stayed ignorable after every ignorable tag was removed.");
        const malformed: UnitConversion<z.output<Schema>> = { kind: UnitConversionKind.malformed, issues: reclassified.issues };
        return malformed;
    }

    function convertUriUnit<Schema extends z.ZodType>(options: { readonly schema: Schema; readonly unit: RawUriUnit; readonly kind: PlaylistKind }) {
        const { schema, unit, kind } = options;
        const unitEntries = entries[kind].unit;
        // The view's units hold this unit alone, at its index, so an issue names the unit as a whole playlist would.
        const units: RawUriUnit[] = [];
        units[unitIndex] = unit;
        const view = viewOf({ kind, units });
        function toInput(raw: RawUnit) {
            const values = toTagValues(raw.tags, unitEntries);
            return { ...values, uri: unit.uri, ignored: raw.ignored };
        }
        return convertUnit({ schema, unit, prefix: [UNITS_KEYS[kind], unitIndex], view, toInput });
    }

    /** The parts a unit completes: its own part, none when it is dropped, or the malformed part. */
    function unitParts(unit: RawUriUnit) {
        const kind = scanner.playlistKind();
        switch (kind) {
            case PlaylistKind.media: {
                const conversion = convertUriUnit({ schema: schemas.segmentSchema, unit, kind });
                if (conversion.kind !== UnitConversionKind.converted) {
                    return settleUnconverted(conversion);
                }
                const segment = conversion.value;
                checker.addSegment(segment);
                const fields = resolverOf().resolveSegment(segment);
                const text = takeUnitText(unit);
                const output = createUnit({ data: segment, fields, source: text, range: { start: 0, end: text.length } });
                const part: StreamPart = { kind: StreamPartKind.segment, segment: output };
                return [part];
            }
            case PlaylistKind.multivariant: {
                const conversion = convertUriUnit({ schema: schemas.variantSchema, unit, kind });
                if (conversion.kind !== UnitConversionKind.converted) {
                    return settleUnconverted(conversion);
                }
                const variant = conversion.value;
                streamInfs.push(variant["EXT-X-STREAM-INF"]);
                const text = takeUnitText(unit);
                const output = createUnit({ data: variant, fields: NO_FIELDS, source: text, range: { start: 0, end: text.length } });
                const part: StreamPart = { kind: StreamPartKind.variant, variant: output };
                return [part];
            }
            default: {
                kind satisfies never;
                return unreachable(kind);
            }
        }
    }

    /** Takes a converted unit's text, which the carried lines' text leads, and counts the unit. */
    function takeUnitText(unit: RawUriUnit) {
        unitIndex += 1;
        carried = NO_LINES;
        return buffer.take(unit.range.end);
    }

    function settleUnconverted(conversion: Exclude<UnitConversion<unknown>, { readonly kind: typeof UnitConversionKind.converted }>) {
        if (conversion.kind === UnitConversionKind.malformed) {
            return [malformedPart(conversion.issues)];
        }
        unitIndex += 1;
        carried = conversion.lines;
        return NO_PARTS;
    }

    /** Scans one line read from the stream, returning the parts it completes. */
    function scanLine(read: { readonly text: string; readonly terminator: string }) {
        buffer.append(read.text + read.terminator);
        const step = scanner.scanLine(read.text, read.terminator.length);
        switch (step.kind) {
            case ScanStepKind.read: {
                return NO_PARTS;
            }
            case ScanStepKind.unit: {
                return unitParts(step.unit);
            }
            case ScanStepKind.playlistTag: {
                return playlistTagParts(step);
            }
            case ScanStepKind.malformed: {
                return [malformedPart([step.issue])];
            }
            case ScanStepKind.limitExceeded: {
                return [limitExceededPart(step.limit, step.value)];
            }
            default: {
                step satisfies never;
                return unreachable(step);
            }
        }
    }

    /** Converts the pending segment, returning its part, or the malformed part. */
    function pendingParts(pending: NonNullable<RawPlaylistHead["pendingSegment"]>) {
        const unitEntries = entries[PlaylistKind.media].unit;
        const view = viewOf({ kind: PlaylistKind.media, pendingSegment: pending });
        function toInput(raw: RawUnit) {
            const values = toTagValues(raw.tags, unitEntries);
            return { ...values, ignored: raw.ignored };
        }
        const conversion = convertUnit({ schema: schemas.pendingSegmentSchema, unit: pending, prefix: [PENDING_SEGMENT_KEY], view, toInput });
        if (conversion.kind === UnitConversionKind.malformed) {
            return malformedPart(conversion.issues);
        }
        assertCondition(conversion.kind === UnitConversionKind.converted, "The pending segment was dropped.");
        const segment = conversion.value;
        checker.addPending(segment);
        const fields = resolverOf().resolvePending(segment);
        carried = NO_LINES;
        const text = buffer.take(pending.range.end);
        const output = createUnit({ data: segment, fields, source: text, range: { start: 0, end: text.length } });
        const part: StreamPart = { kind: StreamPartKind.pendingSegment, pendingSegment: output };
        return part;
    }

    /** Converts the playlist's tags and checks the rules spanning tags or units, by the playlist's kind. */
    function checkPlaylistTags(head: RawPlaylistHead) {
        const values = toTagValues(head.tags, entries[head.kind].playlist);
        const ignored = joinLines({ leading: carried, trailing: head.ignored });
        const view = viewOf({ ...head, ignored });
        switch (head.kind) {
            case PlaylistKind.media: {
                const result = schemas.mediaPlaylistTagsSchema.safeParse({ ...values, kind: head.kind, ignored });
                if (!result.success) {
                    return classifyPlaylistTags({ issues: result.error.issues, view });
                }
                const issues = checker.finish(result.data);
                return { kind: ConversionKind.converted, value: { issues, ignored: result.data.ignored } } as const;
            }
            case PlaylistKind.multivariant: {
                let input: Record<string, unknown> = { ...values, kind: head.kind, ignored };
                // Only a Multivariant Playlist's variables are read later, by the IMPORT definitions of its Media Playlists.
                if (head.variables.size > 0) {
                    input = { ...input, variables: head.variables };
                }
                const result = schemas.multivariantPlaylistTagsSchema.safeParse(input);
                if (!result.success) {
                    return classifyPlaylistTags({ issues: result.error.issues, view });
                }
                const issues = findMultivariantPlaylistIssues({ tags: result.data, streamInfs });
                return { kind: ConversionKind.converted, value: { issues, ignored: result.data.ignored } } as const;
            }
            default: {
                head.kind satisfies never;
                return unreachable(head.kind);
            }
        }
    }

    function classifyPlaylistTags(options: { readonly issues: readonly z.core.$ZodIssue[]; readonly view: RawPlaylist }) {
        const classified = classify({ issues: options.issues, view: options.view, prefix: [], scannerOptions });
        assertCondition(classified.kind === ConversionKind.malformed, "A playlist tag ignorable alone passed its schema alone.");
        return classified;
    }

    /** Ends the scan, returning the pending segment's part when there is one, then the final part. */
    function finish() {
        const end = scanner.finish();
        if (end.kind === ScanKind.malformed) {
            return [malformedPart([end.issue])];
        }
        const head = end.playlist;
        const parts: StreamPart[] = [];
        if (head.pendingSegment !== undefined) {
            const pending = pendingParts(head.pendingSegment);
            if (pending.kind === StreamPartKind.malformed) {
                return [pending];
            }
            parts.push(pending);
        }
        const checked = checkPlaylistTags(head);
        if (checked.kind === ConversionKind.malformed) {
            parts.push(malformedPart(checked.issues));
            return parts;
        }
        const { malformed, violations } = partitionIssues({ issues: checked.value.issues, policy });
        if (malformed.length > 0) {
            parts.push(malformedPart(malformed));
            return parts;
        }
        const endPart: StreamPart = {
            kind: StreamPartKind.end,
            playlistKind: head.kind,
            ignored: checked.value.ignored,
            text: buffer.rest(),
            variables: head.variables,
            violations: joinLines({ leading: end.violations, trailing: violations }),
        };
        parts.push(endPart);
        return parts;
    }

    return { scanLine, finish };
}

function isFinal(part: StreamPart) {
    const isMalformed = part.kind === StreamPartKind.malformed;
    return isMalformed || part.kind === StreamPartKind.limitExceeded;
}

/**
 * Parses a stream of chunks, yielding each playlist tag as it is kept, each unit as its URI line
 * completes it, and the pending segment once the stream ends, then one final part: end with the
 * violations, or malformed or limitExceeded. A malformed or limitExceeded part ends the stream at
 * once, and reading stops there.
 */
export async function* parseStream(options: {
    readonly chunks: AsyncIterable<string> | AsyncIterable<Uint8Array>;
    readonly context: StreamContext;
}) {
    const { chunks, context } = options;
    const { limits } = context.scannerOptions;
    const session = createStreamSession(context);
    // The source sets the batch count; each batch holds the lines one chunk completes, readLines
    // bounds each line, and the scanner the unit count.
    for await (const batch of readLines({ chunks, lineBytesMax: limits.lineBytesMax })) {
        for (const read of batch) {
            if (read.kind === LineReadKind.malformed) {
                yield malformedPart([read.issue]);
                return;
            }
            if (read.kind === LineReadKind.limitExceeded) {
                yield limitExceededPart(Limit.lineBytesMax, limits.lineBytesMax);
                return;
            }
            const parts = session.scanLine(read);
            for (const part of parts) {
                yield part;
                if (isFinal(part)) {
                    return;
                }
            }
        }
    }
    const finalParts = session.finish();
    for (const part of finalParts) {
        yield part;
    }
}
