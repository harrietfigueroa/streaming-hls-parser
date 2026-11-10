// The factory. createHLS builds the unit schemas from a tag
// table once, and returns the HLS namespace whose safeParse scans text into
// raw units, converts them with one safeParse, and checks the rules that span
// units. The two entry points differ only in the table they pass.
import { z } from "zod";

import { assertCondition, unreachable } from "./assert.js";
import { createMediaPlaylistChecker, findMultivariantPlaylistIssues } from "./check-playlist.js";
import { type Limit, type ParseOptions, resolveLimits } from "./options.js";
import { defaultPolicy, type Policy } from "./policy.js";
import {
    createPlaylist,
    createUnit,
    type MediaPlaylist,
    type MediaSegment,
    type MultivariantPlaylist,
    type Variant,
} from "./output.js";
import { resolveSegmentFields } from "./resolve.js";
import { revive, type Reviver } from "./revive.js";
import { stringify } from "./stringify.js";
import { parseStream, type RevivedStreamPart, type StreamPart, StreamPartKind } from "./parse-stream.js";
import { type Issue, Severity } from "./rule.js";
import { type RawPlaylist, type RawTag, ScanKind, scanPlaylist } from "./scan.js";
import {
    buildSchemas,
    toTagValues,
    type ConvertedMediaPlaylist,
    type ConvertedPlaylist,
    type ConvertedMultivariantPlaylist,
    type ConvertedVariant,
} from "./schemas.js";
import {
    classifySchemaIssue,
    type IgnorableTag,
    SchemaIssueKind,
    UNITS_KEYS,
    withIgnoredTags,
} from "./schema-issues.js";
import { type EntriesByKind, PlaylistKind, type TagEntry, type TagTables } from "./tag-table.js";

export { PlaylistKind } from "./tag-table.js";

export const ParseKind = { parsed: "parsed", malformed: "malformed", limitExceeded: "limitExceeded" } as const;
export type ParseKind = (typeof ParseKind)[keyof typeof ParseKind];

export type { DataOf, MediaPlaylist, MediaSegment, MultivariantPlaylist, PendingSegment, Variant } from "./output.js";
export type { Jsonified } from "./jsonify.js";

/** A parsed playlist of either kind. */
export type Playlist = MediaPlaylist | MultivariantPlaylist;

type PlaylistsByKind = {
    [PlaylistKind.media]: MediaPlaylist;
    [PlaylistKind.multivariant]: MultivariantPlaylist;
};
/** The parsed playlist of kind `K`. */
export type PlaylistOfKind<K extends PlaylistKind> = PlaylistsByKind[K];

/** Parse options that name the playlist's kind, which a parse narrowing its type to that kind requires. */
export type KindParseOptions<K extends PlaylistKind> = ParseOptions & { readonly kind: K };



type ParsePayloads<P> = {
    [ParseKind.parsed]: { readonly playlist: P; readonly violations: readonly Issue[] };
    [ParseKind.malformed]: { readonly issues: readonly Issue[] };
    [ParseKind.limitExceeded]: { readonly limit: Limit; readonly value: number };
};
type ParseMember<P, K extends ParseKind> = { readonly kind: K } & ParsePayloads<P>[K];
type ParseOf<P> = { [K in ParseKind]: ParseMember<P, K> }[ParseKind];
/** The outcome of HLS.safeParse, keyed by kind. */
export type Parse = ParseOf<Playlist>;
/** The outcome of HLS.safeParse with the kind option `K`: a parsed outcome's playlist is of that kind. */
export type ParseOfKind<K extends PlaylistKind> = ParseOf<PlaylistOfKind<K>>;
/** The outcome of HLS.safeParse with a reviver: a parsed outcome's playlist is the reviver's return for the root. */
export type RevivedParse = ParseOf<unknown>;

export type { Reviver } from "./revive.js";
export { type RevivedStreamPart, type StreamPart, StreamPartKind } from "./parse-stream.js";
export type { PlaylistTag } from "./output.js";

type FailedPartKind = typeof StreamPartKind.malformed | typeof StreamPartKind.limitExceeded;
/** A part a streaming HLS.parse yields, which throws in place of a failure part. */
export type ParsedStreamPart = Exclude<StreamPart, { readonly kind: FailedPartKind }>;
/** A part a streaming HLS.parse with a reviver yields. */
export type RevivedParsedStreamPart = Exclude<RevivedStreamPart, { readonly kind: FailedPartKind }>;

const ConversionKind = { converted: "converted", failed: "failed" } as const;
type ConversionKind = (typeof ConversionKind)[keyof typeof ConversionKind];

type ConversionPayloads = {
    [ConversionKind.converted]: { readonly playlist: ConvertedPlaylist };
    [ConversionKind.failed]: { readonly broken: readonly Issue[]; readonly ignorables: readonly IgnorableTag[] };
};
type ConversionMember<K extends ConversionKind> = { readonly kind: K } & ConversionPayloads[K];
type Conversion = { [K in ConversionKind]: ConversionMember<K> }[ConversionKind];

function malformedParse(issues: readonly Issue[]) {
    const malformed: Parse = { kind: ParseKind.malformed, issues };
    return malformed;
}

/** Maps each tag name to its entry, asserting the table states a required rule exactly for the tags whose schema rejects absence. */
function toEntriesMap(unit: {
    readonly shape: Readonly<Record<string, z.ZodType>>;
    readonly entries: Readonly<Record<string, TagEntry>>;
}) {
    const entriesMap = new Map(Object.entries(unit.entries));
    for (const [name, schema] of Object.entries(unit.shape)) {
        const entry = entriesMap.get(name);
        assertCondition(entry !== undefined, `Tag ${name} has a schema and no entry.`);
        const acceptsAbsence = schema.safeParse(undefined).success;
        const hasRequiredRule = entry.required !== undefined;
        assertCondition(acceptsAbsence !== hasRequiredRule, `Tag ${name}'s required rule disagrees with its schema.`);
    }
    assertCondition(entriesMap.size === Object.keys(unit.shape).length, "The entries map names a tag the shape lacks.");
    return entriesMap;
}

function toPlaylistInput(playlist: RawPlaylist, entries: EntriesByKind) {
    const kindEntries = entries[playlist.kind];
    const units = [];
    for (const unit of playlist.units) {
        const unitValues = toTagValues(unit.tags, kindEntries.unit);
        units.push({ ...unitValues, uri: unit.uri, ignored: unit.ignored });
    }
    const values = toTagValues(playlist.tags, kindEntries.playlist);
    const unitsKey = UNITS_KEYS[playlist.kind];
    // Only a Multivariant Playlist's variables are read later, by the IMPORT definitions of its Media Playlists.
    const hasImportableVariables = playlist.kind === PlaylistKind.multivariant && playlist.variables.size > 0;
    if (hasImportableVariables) {
        return { ...values, kind: playlist.kind, [unitsKey]: units, variables: playlist.variables, ignored: playlist.ignored };
    }
    const pending = playlist.pendingSegment;
    if (pending === undefined) {
        return { ...values, kind: playlist.kind, [unitsKey]: units, ignored: playlist.ignored };
    }
    const pendingValues = toTagValues(pending.tags, kindEntries.unit);
    const pendingSegment = { ...pendingValues, ignored: pending.ignored };
    return { ...values, kind: playlist.kind, [unitsKey]: units, pendingSegment, ignored: playlist.ignored };
}

/** Finds every broken rule that spans a converted Media Playlist's tags or units. */
function findMediaPlaylistIssues(playlist: ConvertedMediaPlaylist) {
    const { segments, pendingSegment, ...tags } = playlist;
    const checker = createMediaPlaylistChecker();
    for (const segment of segments) {
        checker.addSegment(segment);
    }
    if (pendingSegment !== undefined) {
        checker.addPending(pendingSegment);
    }
    return checker.finish(tags);
}

function streamInfOf(variant: ConvertedVariant) {
    return variant["EXT-X-STREAM-INF"];
}

/** Finds every broken rule that spans a converted playlist's tags or units, by its kind. */
function findPlaylistIssues(playlist: ConvertedPlaylist) {
    switch (playlist.kind) {
        case PlaylistKind.media: {
            return findMediaPlaylistIssues(playlist);
        }
        case PlaylistKind.multivariant: {
            const { variants, ...tags } = playlist;
            const streamInfs = Array.from(variants, streamInfOf);
            return findMultivariantPlaylistIssues({ tags, streamInfs });
        }
        default: {
            playlist satisfies never;
            return unreachable(playlist);
        }
    }
}

type FailedParse = Exclude<Parse, { readonly kind: typeof ParseKind.parsed }>;

/**
 * Throws a failed outcome, because HLS.parse keeps JSON.parse's contract of returning the value or
 * throwing; HLS.safeParse is the path that returns each outcome. A malformed playlist is a
 * SyntaxError, as JSON.parse reports bad text, and an exceeded limit is a RangeError, a bound the
 * caller set rather than a fault in the text. Each error's cause carries the outcome's data.
 */
function throwFailure(outcome: FailedParse): never {
    switch (outcome.kind) {
        case ParseKind.malformed: {
            const [first] = outcome.issues;
            assertCondition(first !== undefined, "A malformed outcome carries no issue.");
            const message = `The playlist is malformed, with ${outcome.issues.length} broken rules. Section ${first.rule.section}: ${first.detail}`;
            throw new SyntaxError(message, { cause: outcome.issues });
        }
        case ParseKind.limitExceeded: {
            const message = `The playlist exceeds ${outcome.limit}, ${outcome.value}.`;
            throw new RangeError(message, { cause: { limit: outcome.limit, value: outcome.value } });
        }
        default: {
            outcome satisfies never;
            return unreachable(outcome);
        }
    }
}

/** Asserts that a parsed playlist is of the kind the caller expected, which the kind option's narrowed types rely on. */
function assertExpectedKind(options: { readonly outcome: Parse; readonly kind: PlaylistKind | undefined }) {
    const { outcome, kind } = options;
    const isParsedWithKind = outcome.kind === ParseKind.parsed && kind !== undefined;
    if (isParsedWithKind) {
        assertCondition(outcome.playlist.kind === kind, `A ${kind} parse returned a ${outcome.playlist.kind} playlist.`);
    }
    return outcome;
}

/** The playlist of a parsed outcome; every other outcome throws. */
function playlistOf<P>(outcome: ParseOf<P>) {
    if (outcome.kind === ParseKind.parsed) {
        return outcome.playlist;
    }
    return throwFailure(outcome);
}

/** Yields each part of `parts` but a failure, which it throws as HLS.parse throws the static outcome. */
async function* throwingParts<Part extends StreamPart | RevivedStreamPart>(parts: AsyncIterable<Part>) {
    // The parse bounds the parts: one per unit or playlist tag it reads, under its limits.
    for await (const part of parts) {
        if (part.kind === StreamPartKind.malformed) {
            const malformed = malformedParse(part.issues);
            throwFailure(malformed);
        }
        if (part.kind === StreamPartKind.limitExceeded) {
            const exceeded: FailedParse = { kind: ParseKind.limitExceeded, limit: part.limit, value: part.value };
            throwFailure(exceeded);
        }
        yield part;
    }
}

/** Runs `reviver` over the output object a part carries; the end and failure parts carry none and are kept. */
function revivePart(part: StreamPart, reviver: Reviver) {
    switch (part.kind) {
        case StreamPartKind.playlistTag: {
            const revived: RevivedStreamPart = { kind: part.kind, playlistTag: revive({ value: part.playlistTag, reviver }) };
            return revived;
        }
        case StreamPartKind.segment: {
            const revived: RevivedStreamPart = { kind: part.kind, segment: revive({ value: part.segment, reviver }) };
            return revived;
        }
        case StreamPartKind.pendingSegment: {
            const revived: RevivedStreamPart = { kind: part.kind, pendingSegment: revive({ value: part.pendingSegment, reviver }) };
            return revived;
        }
        case StreamPartKind.variant: {
            const revived: RevivedStreamPart = { kind: part.kind, variant: revive({ value: part.variant, reviver }) };
            return revived;
        }
        case StreamPartKind.end:
        case StreamPartKind.malformed:
        case StreamPartKind.limitExceeded: {
            return part;
        }
        default: {
            part satisfies never;
            return unreachable(part);
        }
    }
}

async function* reviveParts(parts: AsyncIterable<StreamPart>, reviver: Reviver) {
    // The parse bounds the parts: one per unit or playlist tag it reads, under its limits.
    for await (const part of parts) {
        yield revivePart(part, reviver);
    }
}

/** A stream of string chunks or of UTF-8 byte chunks. */
export type Chunks = AsyncIterable<string> | AsyncIterable<Uint8Array>;

/** Runs `reviver` over a parsed outcome's playlist; every other outcome carries no playlist and is returned as it is. */
function reviveOutcome(outcome: Parse, reviver: Reviver) {
    if (outcome.kind !== ParseKind.parsed) {
        return outcome;
    }
    const playlist = revive({ value: outcome.playlist, reviver });
    const revived: RevivedParse = { kind: ParseKind.parsed, playlist, violations: outcome.violations };
    return revived;
}

/** Builds a Media Playlist's output objects, each segment with its resolved fields and its text in `raw`'s source. */
function toMediaPlaylist(playlist: ConvertedMediaPlaylist, raw: RawPlaylist) {
    const { segments: convertedSegments, pendingSegment: convertedPending, ...tags } = playlist;
    const resolved = resolveSegmentFields(playlist);
    const segments: MediaSegment[] = [];
    for (const [segmentIndex, segment] of convertedSegments.entries()) {
        const fields = resolved.segments[segmentIndex];
        const rawUnit = raw.units[segmentIndex];
        assertCondition(fields !== undefined, `Segment ${segmentIndex + 1} has no resolved fields.`);
        assertCondition(rawUnit !== undefined, `Segment ${segmentIndex + 1} has no scanned unit.`);
        const unit = createUnit({ data: segment, fields, source: raw.source, range: rawUnit.range });
        segments.push(unit);
    }
    const frozenSegments = Object.freeze(segments);
    const pendingFields = resolved.pendingSegment;
    if (convertedPending === undefined) {
        const data = { ...tags, segments: frozenSegments };
        return createPlaylist({ data, source: raw.source, units: frozenSegments }) satisfies MediaPlaylist;
    }
    const rawPending = raw.pendingSegment;
    assertCondition(pendingFields !== undefined, "The pending segment has no resolved fields.");
    assertCondition(rawPending !== undefined, "The pending segment has no scanned unit.");
    const pendingSegment = createUnit({ data: convertedPending, fields: pendingFields, source: raw.source, range: rawPending.range });
    const units = [...frozenSegments, pendingSegment];
    const data = { ...tags, segments: frozenSegments, pendingSegment };
    return createPlaylist({ data, source: raw.source, units }) satisfies MediaPlaylist;
}

// A variant has no resolved fields.
const NO_FIELDS = Object.freeze({});

/** Builds a Multivariant Playlist's output objects, each variant with its text in `raw`'s source. */
function toMultivariantPlaylist(playlist: ConvertedMultivariantPlaylist, raw: RawPlaylist) {
    const variants: Variant[] = [];
    for (const [variantIndex, variant] of playlist.variants.entries()) {
        const rawUnit = raw.units[variantIndex];
        assertCondition(rawUnit !== undefined, `Variant ${variantIndex + 1} has no scanned unit.`);
        const unit = createUnit({ data: variant, fields: NO_FIELDS, source: raw.source, range: rawUnit.range });
        variants.push(unit);
    }
    const frozenVariants = Object.freeze(variants);
    const data = { ...playlist, variants: frozenVariants };
    return createPlaylist({ data, source: raw.source, units: frozenVariants }) satisfies MultivariantPlaylist;
}

/** The parsed form of a converted playlist, by its kind, built from the scanned playlist it converted. */
function toParsedPlaylist(playlist: ConvertedPlaylist, raw: RawPlaylist) {
    assertCondition(playlist.kind === raw.kind, `The ${playlist.kind} playlist was scanned as ${raw.kind}.`);
    switch (playlist.kind) {
        case PlaylistKind.media: {
            return toMediaPlaylist(playlist, raw);
        }
        case PlaylistKind.multivariant: {
            return toMultivariantPlaylist(playlist, raw);
        }
        default: {
            playlist satisfies never;
            return unreachable(playlist);
        }
    }
}

/** Checks the rules spanning a converted playlist, resolving each issue through `policy`. */
function checkPlaylist(options: {
    readonly playlist: ConvertedPlaylist;
    /** The scanned playlist `playlist` converted from, whose source and unit ranges the output keeps. */
    readonly raw: RawPlaylist;
    readonly violations: readonly Issue[];
    readonly policy: Policy;
}) {
    const { playlist, policy } = options;
    const malformedIssues: Issue[] = [];
    const violations = Array.from(options.violations);
    const issues = findPlaylistIssues(playlist);
    for (const issue of issues) {
        if (policy(issue.rule) === Severity.malformed) {
            malformedIssues.push(issue);
        } else {
            violations.push(issue);
        }
    }
    if (malformedIssues.length > 0) {
        return malformedParse(malformedIssues);
    }
    // Resolution reads the rules just checked as holding, such as each offset-less byte range following a sub-range.
    const parsedPlaylist = toParsedPlaylist(playlist, options.raw);
    const parsed: Parse = { kind: ParseKind.parsed, playlist: parsedPlaylist, violations };
    return parsed;
}

// A Multivariant Playlist with no EXT-X-DEFINE declares no variable, so every IMPORT against it fails.
const NO_VARIABLES: ReadonlyMap<string, string> = new Map();

/** The variables an IMPORT reads: those of the Multivariant Playlist the options give, when they give one. */
function importedVariablesOf(options: ParseOptions) {
    let imported: ReadonlyMap<string, string> | undefined;
    if (options.multivariant !== undefined) {
        imported = NO_VARIABLES;
        if (options.multivariant.variables !== undefined) {
            imported = options.multivariant.variables;
        }
    }
    return imported;
}

/** Creates the HLS namespace over `tables`, whose schemas are either as declared or compiled. */
export function createHLS(tables: TagTables) {
    const schemas = buildSchemas(tables);
    const entries: EntriesByKind = {
        [PlaylistKind.media]: {
            playlist: toEntriesMap(tables.media.playlist),
            unit: toEntriesMap(tables.media.unit),
            rules: tables.media.rules,
        },
        [PlaylistKind.multivariant]: {
            playlist: toEntriesMap(tables.multivariant.playlist),
            unit: toEntriesMap(tables.multivariant.unit),
            rules: tables.multivariant.rules,
        },
    };
    const policy: Policy = defaultPolicy;

    function parseInput(playlist: RawPlaylist) {
        const input = toPlaylistInput(playlist, entries);
        switch (playlist.kind) {
            case PlaylistKind.media: {
                return schemas.mediaPlaylistSchema.safeParse(input);
            }
            case PlaylistKind.multivariant: {
                return schemas.multivariantPlaylistSchema.safeParse(input);
            }
            default: {
                playlist.kind satisfies never;
                return unreachable(playlist.kind);
            }
        }
    }

    // A value failing its schema has no typed form to place in the playlist, so a broken rule here is
    // malformed under every policy.
    function convert(playlist: RawPlaylist) {
        const result = parseInput(playlist);
        if (result.success) {
            const converted: Conversion = { kind: ConversionKind.converted, playlist: result.data };
            return converted;
        }
        const broken: Issue[] = [];
        const ignorables: IgnorableTag[] = [];
        const ignoredTags = new Set<RawTag>();
        for (const issue of result.error.issues) {
            const schemaIssue = classifySchemaIssue({ issue, playlist, entries });
            if (schemaIssue.kind === SchemaIssueKind.broken) {
                broken.push(schemaIssue.issue);
            } else if (!ignoredTags.has(schemaIssue.ignorable.tag)) {
                ignoredTags.add(schemaIssue.ignorable.tag);
                ignorables.push(schemaIssue.ignorable);
            }
        }
        const failed: Conversion = { kind: ConversionKind.failed, broken, ignorables };
        return failed;
    }

    function parseText(text: string, options: ParseOptions = {}) {
        const limits = resolveLimits(options);
        const imported = importedVariablesOf(options);
        const scan = scanPlaylist({ text, entries, policy, limits, uri: options.uri, imported, kind: options.kind });
        if (scan.kind === ScanKind.malformed) {
            return malformedParse([scan.issue]);
        }
        if (scan.kind === ScanKind.limitExceeded) {
            const exceeded: Parse = { kind: ParseKind.limitExceeded, limit: scan.limit, value: scan.value };
            return exceeded;
        }
        const first = convert(scan.playlist);
        if (first.kind === ConversionKind.converted) {
            const checked = checkPlaylist({ playlist: first.playlist, raw: scan.playlist, violations: scan.violations, policy });
            return assertExpectedKind({ outcome: checked, kind: options.kind });
        }
        if (first.broken.length > 0) {
            return malformedParse(first.broken);
        }
        // Every issue names a tag 6.3.1 ignores, so the playlist converts again without those tags.
        const withoutIgnored = withIgnoredTags(scan.playlist, first.ignorables);
        const second = convert(withoutIgnored);
        if (second.kind === ConversionKind.converted) {
            const checked = checkPlaylist({ playlist: second.playlist, raw: withoutIgnored, violations: scan.violations, policy });
            return assertExpectedKind({ outcome: checked, kind: options.kind });
        }
        assertCondition(second.ignorables.length === 0, "A tag stayed ignorable after every ignorable tag was removed.");
        return malformedParse(second.broken);
    }

    /**
     * Parses `text`, returning each outcome. A reviver passed second runs over a parsed playlist as
     * JSON.parse runs one over its value, and the options then go third.
     */
    function parseChunks(chunks: Chunks, options: ParseOptions = {}) {
        const limits = resolveLimits(options);
        const imported = importedVariablesOf(options);
        const scannerOptions = { entries, policy, limits, uri: options.uri, imported, kind: options.kind };
        return parseStream({ chunks, context: { tables, schemas, scannerOptions } });
    }

    /**
     * Parses `text`, returning each outcome, or a stream of chunks, yielding each part as it completes
     * and a failure as its last part. A reviver passed second runs over a parsed playlist, or over each
     * part's output object, as JSON.parse runs one over its value, and the options then go third.
     */
    function safeParse<K extends PlaylistKind>(text: string, options: KindParseOptions<K>): ParseOfKind<K>;
    function safeParse(text: string, options?: ParseOptions): Parse;
    function safeParse(text: string, reviver: Reviver, options?: ParseOptions): RevivedParse;
    function safeParse(chunks: Chunks, options?: ParseOptions): AsyncGenerator<StreamPart, void>;
    function safeParse(chunks: Chunks, reviver: Reviver, options?: ParseOptions): AsyncGenerator<RevivedStreamPart, void>;
    function safeParse(input: string | Chunks, reviverOrOptions?: Reviver | ParseOptions, revivedOptions?: ParseOptions) {
        if (typeof input !== "string") {
            if (typeof reviverOrOptions === "function") {
                const parts = parseChunks(input, revivedOptions);
                return reviveParts(parts, reviverOrOptions);
            }
            return parseChunks(input, reviverOrOptions);
        }
        const text = input;
        if (typeof reviverOrOptions === "function") {
            const outcome = parseText(text, revivedOptions);
            return reviveOutcome(outcome, reviverOrOptions);
        }
        return parseText(text, reviverOrOptions);
    }

    /**
     * Parses as safeParse does: `text` to the playlist, or the reviver's return, and a stream to its
     * parts. Every other outcome throws, and a stream throws in place of its failure part.
     */
    function parse<K extends PlaylistKind>(text: string, options: KindParseOptions<K>): PlaylistOfKind<K>;
    function parse<P extends Playlist>(text: string, options: KindParseOptions<P["kind"]>): PlaylistOfKind<P["kind"]>;
    function parse(text: string, options?: ParseOptions): Playlist;
    function parse(text: string, reviver: Reviver, options?: ParseOptions): unknown;
    function parse(chunks: Chunks, options?: ParseOptions): AsyncGenerator<ParsedStreamPart, void>;
    function parse(chunks: Chunks, reviver: Reviver, options?: ParseOptions): AsyncGenerator<RevivedParsedStreamPart, void>;
    function parse(input: string | Chunks, reviverOrOptions?: Reviver | ParseOptions, revivedOptions?: ParseOptions) {
        if (typeof input !== "string") {
            if (typeof reviverOrOptions === "function") {
                const revivedParts = safeParse(input, reviverOrOptions, revivedOptions);
                return throwingParts(revivedParts);
            }
            const parts = safeParse(input, reviverOrOptions);
            return throwingParts(parts);
        }
        const text = input;
        if (typeof reviverOrOptions === "function") {
            const revived = safeParse(text, reviverOrOptions, revivedOptions);
            return playlistOf(revived);
        }
        const outcome = safeParse(text, reviverOrOptions);
        return playlistOf(outcome);
    }

    return Object.freeze({ safeParse, parse, stringify });
}
