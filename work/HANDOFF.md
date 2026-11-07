# Handoff: streaming-hls-parser rebuild

This repository is a full rebuild of `github.com/harrietfigueroa/streaming-hls-parser`, published as `streaming-hls-parser` 0.2.0. Design is complete. Every Media Playlist tag of sections 4.4.1 to 4.4.5 parses through `HLS.safeParse`, and section 4.4.6's Multivariant Playlist work is under way. Read this file first, then `work/decisions/decisions.jsonl` for the reasoning behind any rule below.

## Where things stand

The work is on the branch `rebuild`, created from `origin/main`, and is open as a pull request into `main` that the user merges (decision 45). All 456 tests pass, `tsc --noEmit` is clean, and `style-lint` is clean on every committed file.

| Commit | Content |
| --- | --- |
| `fde4fab` to `c962e55` | The previous implementation removed unread (decision 35), the vendored spec, the decision log, package setup, the zod benchmark, and sections 4.1 to 4.3. |
| `692502f` | Section 4.4.1: `EXTM3U` and `EXT-X-VERSION`. |
| `ab08e6b`, `b37983c` | The minimal static path (decision 52): `EXT-X-TARGETDURATION`, `EXT-X-ENDLIST`, `EXTINF`, and `src/library/` with the tag table, the scanner, the severity policy, `createHLS`, and the default entry `src/index.ts` (decision 53). |
| `3032754` | Attribute-list tags, `EXT-X-INDEPENDENT-SEGMENTS`, `EXT-X-START`, and section 6.3.1's whole-tag ignores (decision 55). |
| `5c433e6`, `ab03f2d` | Decision 30's limits under `options.limits`, and the `limitExceeded` outcome (decision 56). |
| `32e31e6` | `EXT-X-DEFINE`, variable substitution in the scanner, and repeated tags (decision 57). |
| `4479d68` | The remaining section 4.4.3 tags, with the server-control bounds checked after conversion (decision 58). |
| `69dd4c5`, `897feb6`, `eb6fa24` | Every section 4.4.4 tag, decision 28's `DateTime` and its conversion functions, and the `pendingSegment` of a live Low-Latency playlist (decisions 59 and 60). |
| `b79aafd`, `4a182ba` | Every section 4.4.5 tag, with Date Range X- attributes kept in `clientAttributes` and illegal Date Ranges ignored (decision 61). |
| `41b9ec6` | The section modules for `EXT-X-STREAM-INF` and `EXT-X-I-FRAME-STREAM-INF`, the mixing rules, and ignore reasons carried in a custom issue's `params.ignoreReason`. |

## Where to look

- `spec/draft-pantos-hls-rfc8216bis-22.txt` is the pinned spec (decision 1). Code mirrors its section numbering.
- `work/decisions/decisions.jsonl` holds 61 decisions. It is append-only: a correction is a new line with an `amends` field (decision 9).
- `work/backlog/backlog.jsonl` is append-only too. The latest line for an `id` gives that item's current state.
- `work/pending/multivariant-end-to-end-tests.patch` holds the end-to-end tests for the Multivariant work in progress, written and run red but not committed, since nothing makes them pass yet. It applies to `tests/index.test.ts` at HEAD with `git apply`.
- `src/<n>-<heading>/<n.n>-<heading>/…` holds one file per spec section (decision 33). A section that is a directory keeps its section-wide rules in a file named after it inside the directory (decision 54). `src/library/` holds code that belongs to no section.
- `tests/` mirrors `src/`. `tests/index.test.ts` tests the default entry end to end. `tests/fixtures/very-large-playlist.m3u8` is the 11,701-segment real-world fixture.
- `bench/` holds the zod benchmark, kept to rerun against the real schemas (decision 47).

## How the parser is built

A parse runs in three passes, each in its own module under `src/library/`:

1. `scan.ts` walks the lines once. It applies sections 4.1 and 4.4.1.1's line rules, parses attribute lists, substitutes variables, resolves each `EXT-X-DEFINE` as it is read, and groups each tag's raw value into the playlist, a segment, or the pending segment. Positional rules live here too: `precedesSegments`, `precedesParts`, and the discontinuity sequence's order.
2. `create-hls.ts` converts the raw playlist with one `safeParse` of a unit schema built from `tag-table.ts`. `schema-issues.ts` maps each zod issue to its tag's format or required rule, or to an ignore reason. Ignored tags move into the ignored lines in position, and the playlist converts once more (decision 55).
3. `findPlaylistIssues` in `create-hls.ts` runs the rules that span tags or units over the typed playlist. Every issue resolves through `policy.ts` (decision 8).

`tag-table.ts` is the one place a tag is registered. Each entry gives its value form, its format rule, its occurrence, and any required, `precedesSegments`, `precedesParts`, or `ignoreOnFormatFailure` rule. `createHLS` asserts at startup that a required rule is present exactly when the tag's schema rejects absence.

## Next steps

1. Finish section 4.4.6. The playlist-kind architecture is designed and not yet built:
   - **Tag table:** split it by kind, `media` (`playlist`, unit `segment`) and `multivariant` (`playlist`, unit `variant`), with the 4.4.1 and 4.4.2 tags shared by both.
   - **Kind detection:** the scanner settles the kind from the first kind-specific tag. A tag of the other kind is malformed, citing `mediaPlaylistTagRules.notInMultivariant`, `mediaSegmentTagRules.notInMultivariant`, or `multivariantPlaylistTagRules.notInMedia`. Section 4.4.5's tags count as media for this.
   - **Units:** the raw playlist holds one `units` list, which becomes `segments` or `variants` in the output, and the outcome's playlist becomes `MediaPlaylist | MultivariantPlaylist`.
   - **Ignored variants:** a variant whose `EXT-X-STREAM-INF` is ignored becomes ignored lines: its tag as `ignoredTag` and its URI line as a new `ignoredUri` kind citing `ignoreReasons.followsIgnoredStreamInf`, carried to the next unit's ignored lines.
   - **Rules to apply:** a trailing `EXT-X-STREAM-INF` breaks `extXStreamInfRules.uriRequired`, and a URI with no `EXT-X-STREAM-INF` breaks `precedesUri`.
   - **Tests:** apply `work/pending/multivariant-end-to-end-tests.patch` first.

   Then `EXT-X-MEDIA` with its Rendition Group rules, `EXT-X-SESSION-DATA`, `EXT-X-SESSION-KEY`, and `EXT-X-CONTENT-STEERING`, and finally `IMPORT` through decision 15's `multivariant` option. That option needs the Multivariant Playlist's resolved Variable Values, which the output does not yet carry.
2. Extend `src/library/` with the rest:
   - `HLS.parse` (decision 7);
   - the precompiled entry (decisions 17 and 18);
   - the streaming scanner (decisions 6 and 21);
   - prototypes and `toHLS` (decisions 42 and 43);
   - resolved fields (decision 26);
   - the reviver (decision 20).
3. Extract the spec's 15 embedded playlists into `tests/fixtures/` with a TypeScript script, and add one negative fixture per rule with a test that every rule has one (decision 32). Several examples are excerpts with `...` lines, which parse as URIs, so the script has to drop or mark them.
4. Add section barrels (decision 33) when a module outside a section first imports through a public surface. None exist yet.

Backlog items 2 and 4 to 14 remain open. Items 7 (performance checks) and 10 (lenient policy) most affect the build order. Items 11 to 14 are section 4 rules waiting on something else: section 8's version table, the raw `EXTINF` text, the line order between `EXT-X-KEY` and `EXT-X-MAP`, and Date Range Following Range resolution.

## Open questions for the user

- **Decision 27 and the spec disagree on date-time offsets (decision 59).** Decision 27 requires an offset on every date-time, but section 4.4.4.6 says a date-time only SHOULD indicate a time zone. An `EXT-X-PROGRAM-DATE-TIME` without an offset is valid per the spec and malformed here.
- **Decisions 54, 59, 60, 61, and 58 record readings Claude made without gating, each open to correction.** They cover:
  - one `EXTINF`, and one of each next-segment tag, per segment;
  - trailing segment tags;
  - the pending segment;
  - `clientAttributes`;
  - `EXT-X-SERVER-CONTROL`'s `NO` values ignoring the tag.

## Conventions this codebase follows

The user's global style guide governs, and `style-lint` enforces its deterministic half on every commit through a hook. The rules most often hit so far:

- Every union is keyed by `kind`, its kinds declared once as an `as const` object, with constructed values bound to an intermediate annotated with the union and returned by name.
- Scalar module constants are SCREAMING_CASE, and every meaningful literal is a named constant, including `-1` from `indexOf` (named `NOT_FOUND`).
- Callbacks are hoisted named functions, never closure-free arrows. That includes Vitest bench test bodies, which take a `TestContext`.
- No type assertions, and no disable comments: this repository runs no ESLint of its own, so a disable would name a rule nobody here can look up.
- A nullable parameter, two parameters of one type, or three or more parameters go through an options object.
- Comments are present tense and positive, and make no claim that an edit to another file falsifies.
- Assertions go through `src/library/assert.ts`. The only sanctioned `throw` is `new AssertionError` for an impossible state, and test helpers that need a value from a schema use it too.
- Each section module declares its rules as `<section>Rules` objects of type `Rule`, citing the section that states the rule, even when another module applies it.
- A tag schema that marks its tag for a whole-tag ignore raises a custom issue with `params: { ignoreReason }`, an `IgnoreReason` from the section that states the ignore.

## Tooling notes

- Vitest 5.1 has no top-level `bench`. A benchmark is a `test` whose `TestContext` provides `bench`, run through `bench.compare(...registrations, runOptions)`, and its results print only with `--reporter=verbose`.
- TypeScript is 7.0.2, and `@types/node` is pinned to 22.x to match the oldest supported Node (decision 22).
- `splice` matches every hunk in one script against the file before any hunk applies, so overlapping edits (two renames on one line) go in separate calls. A hunk of context lines alone is refused; insert by placing `+` lines beside a context line. `@@ regex` supports `${1}` captures.
- An unquoted heredoc (`<<EOF`) expands `$(…)` inside it, which broke a chained `style-lint $(git ls-files …)`. Run that command on its own line.
- zod 4 drops an optional key that is present with the value `undefined`, which is why a valueless tag's raw value is `true` (decision 53). `z.compile` returns its input's type, so compiled schemas fit the same unit shapes.
- The shell is zsh, so `PIPESTATUS` is unavailable. Print `$?` from a separate command.
- The staging hook refuses `stage files $(…)` and other generated path lists. Name each file.
- Never read code from the previous implementation. Its `package.json`, its playlists, and its `.github` config are the only files that may be read (decisions 35 and 45).

## Process notes

Each section is built test-first: write the failing test, run it to watch it fail, implement, then typecheck and lint before committing. Section 4.4.5.2 to 4.4.5.4's modules were written in the same command as their tests, so the tests never ran red. A mutation run with `splice try --expect-fail` confirmed afterward that they catch broken implementations, and the next session should keep the order instead. Decisions are logged as they happen, with who proposed and who decided, before the work that depends on them.
