// The parse options. This module is pure: it resolves a call's
// partial limits against the named defaults, asserting each is a positive
// integer, since a malformed limit is the caller's programmer error.
import { assertCondition } from "./assert.js";
import type { MultivariantPlaylist } from "./create-hls.js";

export const Limit = {
    lineBytesMax: "lineBytesMax",
    substitutedLineBytesMax: "substitutedLineBytesMax",
    unitCountMax: "unitCountMax",
} as const;
export type Limit = (typeof Limit)[keyof typeof Limit];

/** The bounds one parse runs under: line length before and after substitution, and the count of units. */
export type Limits = { readonly [Name in Limit]: number };

// Initial defaults, to be adjusted against benchmarks and real playlists.
const LINE_BYTES_MAX_DEFAULT = 1024 * 1024;
const SUBSTITUTED_LINE_BYTES_MAX_DEFAULT = 1024 * 1024;
const UNIT_COUNT_MAX_DEFAULT = 1_000_000;

const limitsDefault = {
    [Limit.lineBytesMax]: LINE_BYTES_MAX_DEFAULT,
    [Limit.substitutedLineBytesMax]: SUBSTITUTED_LINE_BYTES_MAX_DEFAULT,
    [Limit.unitCountMax]: UNIT_COUNT_MAX_DEFAULT,
} as const satisfies Limits;

/** Options for one parse. */
export type ParseOptions = {
    /** The playlist's URI, which QUERYPARAM variables read their values from. */
    readonly uri?: URL;
    /** The Multivariant Playlist the parsed playlist was loaded from, whose variables IMPORT definitions read. */
    readonly multivariant?: MultivariantPlaylist;
    /** Overrides for any of the default limits. */
    readonly limits?: Partial<Limits>;
};

function resolveLimit(overrides: Partial<Limits>, name: Limit) {
    let value: number = limitsDefault[name];
    const override = overrides[name];
    if (override !== undefined) {
        value = override;
    }
    assertCondition(Number.isSafeInteger(value), `Limit ${name} is ${value}, not an integer.`);
    assertCondition(value > 0, `Limit ${name} is ${value}, not positive.`);
    return value;
}

/** Resolves each limit to the call's override, or to its default where the call gives none. */
export function resolveLimits(options: ParseOptions) {
    let overrides: Partial<Limits> = {};
    if (options.limits !== undefined) {
        overrides = options.limits;
    }
    const resolved: Limits = {
        [Limit.lineBytesMax]: resolveLimit(overrides, Limit.lineBytesMax),
        [Limit.substitutedLineBytesMax]: resolveLimit(overrides, Limit.substitutedLineBytesMax),
        [Limit.unitCountMax]: resolveLimit(overrides, Limit.unitCountMax),
    };
    return resolved;
}
