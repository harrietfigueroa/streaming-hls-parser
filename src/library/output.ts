// Output objects. Each parsed playlist and unit is a frozen object whose own
// enumerable keys are its data alone, built on one of two shared, frozen
// prototypes that carry its methods, as a URL carries its methods. Each object's
// source text lives in private fields rather than in its keys, so a spread, a
// reviver, or Object.keys sees data only, and toHLS returns the text exactly.
// Private fields are ordinary slots on the object, which a collection marks in
// one pass, where a WeakMap entry per object lengthens every full collection.
import { assertCondition } from "./assert.js";
import { jsonify } from "./jsonify.js";
import type { ResolvedFields } from "./resolve.js";
import type { TextRange } from "./scan.js";
import { type Stringifiable, stringify } from "./stringify.js";
import type {
    ConvertedMediaPlaylist,
    ConvertedMediaSegment,
    ConvertedPendingSegment,
    ConvertedMultivariantPlaylist,
    ConvertedVariant,
} from "./schemas.js";

/** The options of toHLS: `canonical` writes the value as HLS.stringify does, in place of the text as written. */
export type ToHLSOptions = { readonly canonical?: boolean };

/** Where a unit's text lies in the source it was parsed from. */
type UnitSource = { readonly source: string; readonly range: TextRange };

/** A playlist's source, and its units in order, whose ranges divide the source into chunks. */
type PlaylistSource = { readonly source: string; readonly units: readonly object[] };

// One chunk per stream pull keeps a playlist's encoded text from being held at once.
const STREAM_HIGH_WATER_MARK = 1;

const NOT_BUILT_MESSAGE = "The object was not built by the parser, so it has no source text.";

/** Reads a unit's source and range, which only UnitMethods's own static block can define. */
let readUnitSource: (unit: object) => UnitSource;

function unitTextOf(unit: object) {
    const { source, range } = readUnitSource(unit);
    return source.slice(range.start, range.end);
}

/** Yields a playlist's source in chunks: each unit's text, and each run of the playlist's own lines between them. */
function* chunksOf(playlistSource: PlaylistSource) {
    const { source, units } = playlistSource;
    let offset = 0;
    for (const unit of units) {
        const { range } = readUnitSource(unit);
        assertCondition(range.start >= offset, `A unit starts at ${range.start}, inside the chunk ending at ${offset}.`);
        if (range.start > offset) {
            yield source.slice(offset, range.start);
        }
        yield source.slice(range.start, range.end);
        offset = range.end;
    }
    if (offset < source.length) {
        yield source.slice(offset);
    }
}

/** The methods of a parsed unit: a Media Segment, the pending Parent Segment, or a Variant Stream. */
export class UnitMethods {
    readonly #source: string;
    readonly #range: TextRange;

    constructor(unitSource: UnitSource) {
        this.#source = unitSource.source;
        this.#range = unitSource.range;
    }

    static {
        function unitSourceOf(unit: object) {
            assertCondition(#range in unit, NOT_BUILT_MESSAGE);
            const unitSource: UnitSource = { source: unit.#source, range: unit.#range };
            return unitSource;
        }
        readUnitSource = unitSourceOf;
    }

    /** The unit's lines exactly as written, from the line after the playlist tag or URI line before it through its last. */
    toHLS<T extends Stringifiable>(this: T, options: ToHLSOptions = {}) {
        if (options.canonical === true) {
            return stringify(this);
        }
        return unitTextOf(this);
    }

    /** The unit's lines exactly as written, as toHLS returns them. */
    toString() {
        return unitTextOf(this);
    }

    /** The unit's data with each bigint written as its decimal string. */
    toJSON<T>(this: T) {
        return jsonify(this);
    }
}

/** The methods of a parsed playlist of either kind. */
export class PlaylistMethods {
    readonly #source: string;
    readonly #units: readonly object[];

    constructor(playlistSource: PlaylistSource) {
        this.#source = playlistSource.source;
        this.#units = playlistSource.units;
    }

    static #playlistSourceOf(playlist: object) {
        assertCondition(#units in playlist, NOT_BUILT_MESSAGE);
        const playlistSource: PlaylistSource = { source: playlist.#source, units: playlist.#units };
        return playlistSource;
    }

    static #textOf(playlist: object) {
        const playlistSource = PlaylistMethods.#playlistSourceOf(playlist);
        const chunks = Array.from(chunksOf(playlistSource));
        return chunks.join("");
    }

    /** The playlist's text exactly as written. */
    toHLS<T extends Stringifiable>(this: T, options: ToHLSOptions = {}) {
        if (options.canonical === true) {
            return stringify(this);
        }
        return PlaylistMethods.#textOf(this);
    }

    /** The playlist's text exactly as written, as toHLS returns it. */
    toString() {
        return PlaylistMethods.#textOf(this);
    }

    /** The playlist's data with each bigint written as its decimal string. */
    toJSON<T>(this: T) {
        return jsonify(this);
    }

    /** The playlist's text as UTF-8, one chunk per unit or run of playlist lines, produced as the reader pulls. */
    toStream() {
        const playlistSource = PlaylistMethods.#playlistSourceOf(this);
        const chunks = chunksOf(playlistSource);
        const encoder = new TextEncoder();
        return new ReadableStream<Uint8Array>(
            {
                pull(controller) {
                    const next = chunks.next();
                    if (next.done === true) {
                        controller.close();
                        return;
                    }
                    const encoded = encoder.encode(next.value);
                    controller.enqueue(encoded);
                },
            },
            { highWaterMark: STREAM_HIGH_WATER_MARK },
        );
    }
}

type Method = (...parameters: never[]) => unknown;

/** The methods of a playlist tag read from a stream, whose text is its line as written. */
export class TagMethods {
    readonly #text: string;

    constructor(text: string) {
        this.#text = text;
    }

    static #textOf(tag: object) {
        assertCondition(#text in tag, NOT_BUILT_MESSAGE);
        return tag.#text;
    }

    /** The tag's text exactly as written: its line and the lines before it, or empty among a unit's tags. */
    toHLS() {
        return TagMethods.#textOf(this);
    }

    /** The tag's text exactly as written, as toHLS returns it. */
    toString() {
        return TagMethods.#textOf(this);
    }

    /** The tag's data with each bigint written as its decimal string. */
    toJSON<T>(this: T) {
        return jsonify(this);
    }
}

/** `T` without its methods at any level: the shape of a spread, or of a value built by hand. */
export type DataOf<T> = T extends ReadonlyMap<unknown, unknown>
    ? T
    : T extends readonly (infer Element)[]
      ? readonly DataOf<Element>[]
      : T extends object
        ? { readonly [Key in keyof T as T[Key] extends Method ? never : Key]: DataOf<T[Key]> }
        : T;

Object.freeze(UnitMethods.prototype);
Object.freeze(PlaylistMethods.prototype);
Object.freeze(TagMethods.prototype);

/** A parsed Media Segment, with the fields resolved from the tags before it. */
export type MediaSegment = ConvertedMediaSegment & ResolvedFields & UnitMethods;

/** A parsed pending Parent Segment, with the fields resolved from the tags before it. */
export type PendingSegment = ConvertedPendingSegment & ResolvedFields & UnitMethods;

/** A parsed Media Playlist, its segments carrying their resolved fields. */
export type MediaPlaylist = Omit<ConvertedMediaPlaylist, "segments" | "pendingSegment"> & {
    readonly segments: readonly MediaSegment[];
    readonly pendingSegment?: PendingSegment;
} & PlaylistMethods;

/** A parsed Variant Stream: its EXT-X-STREAM-INF and the URI line after it. */
export type Variant = ConvertedVariant & UnitMethods;

/** A parsed Multivariant Playlist. */
export type MultivariantPlaylist = Omit<ConvertedMultivariantPlaylist, "variants"> & {
    readonly variants: readonly Variant[];
} & PlaylistMethods;

/** Builds a frozen unit holding `data` and then `fields` on the unit prototype, its text at `range` in `source`. */
export function createUnit<Data extends object, Fields extends object>(
    options: { readonly data: Data; readonly fields: Fields } & UnitSource,
) {
    const methods = new UnitMethods({ source: options.source, range: options.range });
    const unit = Object.assign(methods, options.data, options.fields);
    // Object.freeze's Readonly return type maps away the private fields that brand UnitMethods, so
    // the frozen object is returned through its own binding.
    Object.freeze(unit);
    return unit;
}

/** Builds a frozen playlist holding `data` on the playlist prototype, its text `source` divided among `units`. */
export function createPlaylist<Data extends object>(options: { readonly data: Data } & PlaylistSource) {
    const methods = new PlaylistMethods({ source: options.source, units: options.units });
    const playlist = Object.assign(methods, options.data);
    // As in createUnit, the frozen object keeps the type that carries PlaylistMethods's private fields.
    Object.freeze(playlist);
    return playlist;
}

/**
 * A playlist tag read from a stream: its name and its converted value, which is a repeated tag's one
 * occurrence. The value's type depends on the name, which a stream learns only as it reads.
 */
export type PlaylistTag = { readonly name: string; readonly value: unknown } & TagMethods;

/** Builds a frozen playlist tag on the tag prototype, its text `text`. */
export function createPlaylistTag(options: { readonly name: string; readonly value: unknown; readonly text: string }) {
    const { name, value, text } = options;
    const methods = new TagMethods(text);
    const tag = Object.assign(methods, { name, value });
    // As in createUnit, the frozen object keeps the type that carries TagMethods's private field.
    Object.freeze(tag);
    return tag satisfies PlaylistTag;
}
