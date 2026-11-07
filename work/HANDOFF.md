# Handoff: streaming-hls-parser rebuild

This repository is a full rebuild of `github.com/harrietfigueroa/streaming-hls-parser`, published as `streaming-hls-parser` 0.2.0. Design is complete. Every tag of section 4.4 parses through `HLS.safeParse`, in Media Playlists and Multivariant Playlists alike, and an `IMPORT` resolves against the `multivariant` option. The precompiled entry, resolved fields, the reviver, prototypes with exact `toHLS`, `HLS.stringify`, and the streaming parse over string or byte chunks are built. Read this file first, then `work/decisions/decisions.jsonl` for the reasoning behind any rule below.

## Where things stand

The work is on the branch `rebuild`, created from `origin/main`, and is open as a pull request into `main` that the user merges (decision 45). All 813 tests pass, `tsc --noEmit` is clean, and `npm run lint` (oxlint) is clean. `style-lint` is clean on every committed file except three kinds of finding, and no disable comment names a rule, since the repository does not run `style-lint`:

- `style/no-schema-parse` on the `HLS.parse(...)` calls in `tests/index.test.ts` and `tests/stream.test.ts`, which it reads as zod's `.parse`. The user chose to leave these open.
- `style/positional-parameters-max` on the `(text, reviver, options)` and `(chunks, reviver, options)` overloads of `safeParse` and `parse` in `create-hls.ts`. Decision 15, which the user decided, declares this shape an exception. Claude left these open without asking, and the commit hook reports them on each commit touching `create-hls.ts`.
- `style/no-nullish-return` on the two revivers in `tests/library/revive.test.ts` that return `undefined`, which is how JSON.parse's reviver contract removes a property. Claude left these open without asking.

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
| `8c90177` | Multivariant Playlists: the tag table split by playlist kind, kind detection in the scanner, `variants`, I-frame streams, and ignored variants carried as `ignoredTag` and `ignoredUri` lines (decision 62). |
| `df8334a` | The repository's own lint run, oxlint with the local plugin under `lint/`, its two rules, and every existing design-log mention and schema brought into line with them (decision 63). |
| `f3150f6` | Section 4.4.6.2 moved into a directory for its subsection 4.4.6.2.1, and decision 64. |
| `bbbf048` | `EXT-X-MEDIA`, its Rendition Groups, a SUBTITLES Rendition's URI, and the Groups each variant names (decision 64). |
| `b7d3aa3` | `EXT-X-SESSION-DATA`, `EXT-X-SESSION-KEY` on EXT-X-KEY's exported attribute table, and `EXT-X-CONTENT-STEERING` (decision 65). |
| `d54b1ef` | The Multivariant Playlist's `variables` Map, the `multivariant` option, and `IMPORT` (decision 66). |
| `0d7d150` | `HLS.parse` over `safeParse`, throwing a SyntaxError or a RangeError (decision 67). |
| `b2208d7` | The precompiled entry `src/precompiled.ts`, `createTagTables(prepare)`, the shared `public-surface.ts`, and the entry benchmark (decision 68). |
| `c8ad635` | Resolved fields on each segment and the pending segment, in `resolve.ts`, with the converted schema types moved to `schemas.ts` (decision 69). |
| `69e69f9` | The reviver, `revive.ts`, through `safeParse` and `parse` overloads (decision 70). |
| `82adeca` | Prototypes in `output.ts` with `toHLS`, `toString`, `toJSON`, and `toStream`, unit text ranges in the scanner, `jsonify.ts`, and `DataOf` (decision 71). |
| `9bc519c` | `HLS.stringify` in `stringify.ts`, `toHLS({ canonical: true })`, per-tag `AttributeWriters` tables, and section 4.2's value writers (decision 72). |
| `0993762` | The streaming line reader `read-lines.ts` and decision 73's streaming design. |
| `0505169` | The line-fed scanner `createScanner`, with `scanPlaylist` driving it; a playlist tag's line counts in the text boundary only once kept. |
| `a83734e` | The incremental spanning checks in `check-playlist.ts`, and backlog item 50. |
| `6fcd5ff` | The streaming parse, `parse-stream.ts`, through `HLS.safeParse(chunks)` and `HLS.parse(chunks)` (decision 74). |

## Where to look

- `spec/draft-pantos-hls-rfc8216bis-22.txt` is the pinned spec (decision 1). Code mirrors its section numbering.
- `work/decisions/decisions.jsonl` holds 74 decisions. It is append-only: a correction is a new line with an `amends` field (decision 9).
- `work/backlog/backlog.jsonl` is append-only too. The latest line for an `id` gives that item's current state.
- `lint/` holds the oxlint plugin (`plugin.ts`) and its rules under `lint/rules/`. `.oxlintrc.json` enables them, and `tests/lint/` tests them through oxlint's `RuleTester`.
- `src/<n>-<heading>/<n.n>-<heading>/…` holds one file per spec section (decision 33). A section that is a directory keeps its section-wide rules in a file named after it inside the directory (decision 54). `src/library/` holds code that belongs to no section.
- `tests/` mirrors `src/`. `tests/index.test.ts` tests the default entry end to end. `tests/fixtures/very-large-playlist.m3u8` is the 11,701-segment real-world fixture.
- `bench/` holds the zod benchmark, kept to rerun against the real schemas (decision 47), and `entries.bench.ts`, a whole parse of the large fixture through each entry, the measurement behind decisions 68 and 71.
- `tests/precompiled.test.ts` checks that the two entries return equal outcomes, and `tests/library/compile.test.ts` compiles every tag schema with `strict: true`.
- `tests/stream.test.ts` compares every streamed part with the static parse of the same text, and `tests/library/read-lines.test.ts` pins the line reader against each way of cutting a text into chunks.

## How the parser is built

A parse runs in three passes, each in its own module under `src/library/`, and then builds its output:

1. `scan.ts`'s `createScanner` takes one line at a time, which `scanPlaylist` feeds from `splitLines` and the streaming parse from `read-lines.ts`. It applies sections 4.1 and 4.4.1.1's line rules, parses attribute lists, substitutes variables, and resolves each `EXT-X-DEFINE` as it is read. It settles the playlist's kind at the first tag only one kind's table holds (`placeInUnsettledKind`, then `placeInSettledKind`), and groups each tag's raw value into the playlist, a unit (a segment or a variant), or the pending segment. Positional rules live here too: the out-of-kind rules, `precedesSegments`, `precedesParts`, and the discontinuity sequence's order.
2. `create-hls.ts` converts the raw playlist with one `safeParse` of its kind's playlist schema, built by `schemas.ts` from `tag-table.ts`. `schema-issues.ts` maps each zod issue to its tag's format or required rule, or to an ignore reason. Ignored tags move into the ignored lines in position, a unit whose ignored tag has `ignoresUri` is dropped with its URI line, and the playlist converts once more (decision 55).
3. `findPlaylistIssues` in `create-hls.ts` runs the rules that span tags or units, by the playlist's kind, through `check-playlist.ts`: `createMediaPlaylistChecker`, which takes each segment in order and keeps only the facts the rules read, or `findMultivariantPlaylistIssues`. Every issue resolves through `policy.ts` (decision 8).
4. Once the checks pass, `toParsedPlaylist` in `create-hls.ts` builds the output. `resolve.ts` computes each segment's resolved fields (decision 69), and `output.ts`'s `createUnit` and `createPlaylist` copy each converted value onto a frozen `UnitMethods` or `PlaylistMethods` instance. They record its source text and the text range the scanner gave its unit in a WeakMap (decision 71). A reviver, when passed, then runs over the result through `revive.ts` (decision 70).

Writing goes the other way. `toHLS()` and `toStream()` slice the recorded source, joining the chunks of `chunksOf` in `output.ts`. `toJSON()` runs `jsonify.ts`. `HLS.stringify` and `toHLS({ canonical: true })` run `stringify.ts`, which writes each tag through its section module's `AttributeWriters` table or value writer (decision 72).

A streaming parse runs the same layers per unit, in `parse-stream.ts` (decisions 73 and 74). `createStreamSession` scans each line, converts each kept playlist tag alone with its tag schema and each unit alone with its unit schema, classifying a failure through `schema-issues.ts` against a view holding only what was converted, and yields a part wrapping the output object, a segment carrying its fields from `createSegmentResolver`. Its text comes from a buffer of the lines read since the last part. At the end it converts the pending segment and the playlist's tags together, which reports an absent required tag, runs the checker, and yields the end part.

`tag-table.ts` is the one place a tag is registered, in the table of its playlist kind, which `createTagTables(prepare)` builds with each schema as declared or compiled (decision 68): `media` (units are segments) or `multivariant` (units are variants), with sections 4.4.1 and 4.4.2's tags in both. Each entry gives its value form, its format rule, its occurrence, and any required, `precedesSegments`, `precedesParts`, `ignoreOnFormatFailure`, or `ignoresUri` rule. Each kind's table also names the rules its tags break in a playlist of the other kind. `createHLS` asserts at startup that a required rule is present exactly when the tag's schema rejects absence.

## Next steps

1. Streaming follow-ups. Background research the user asked for on 2026-11-07 bears on cleanup:
   - An async generator's iterator already disposes through `AsyncIterator.prototype[Symbol.asyncDispose]`, which calls `return()`, so a yielded stream works with `await using` where the runtime supports it.
   - `using` syntax and `DisposableStack` are absent from Node 22 and Safari, so shipped code keeps to `try/finally`.
   - `toStream()` has no `cancel()`, which would call the chunk generator's `return()`.
   - No test yet checks that a consumer breaking out of the parts closes the source's iterator; `for await` in `readLines` should call `return()` on it, and a test with a counting source would confirm it.
   - The streaming parse has no benchmark. `bench/entries.bench.ts` is where one belongs, and backlog item 50 asks that it compare with other popular HLS parsers.
2. Extract the spec's 15 embedded playlists into `tests/fixtures/` with a TypeScript script, and add one negative fixture per rule with a test that every rule has one (decision 32). Several examples are excerpts with `...` lines, which parse as URIs, so the script has to drop or mark them. Section 9.11's example breaks section 4.4.6.1.1 (see the open questions), and sections 9.6 and 9.7 write `CODECS="..."`, which parses as a quoted-string.
3. Add section barrels (decision 33) when a module outside a section first imports through a public surface. None exist yet.
4. Packaging: `package.json` has no `exports` map, `main`, or build script, so neither entry is importable from the published package yet. Decision 46's esbuild bundles and the `./precompiled` export path are unbuilt.
5. Backlog items 7 and 50. The user asked on 2026-11-07 that the performance work web-search for other popular HLS parsers and benchmark this library against them. Building the output objects costs about 5 to 8% at p75 on the large fixture, with GC tails up to about 150 ms that Claude believes come from the 11,701 WeakMap entries in `output.ts` but has not verified. The same research found that V8 marks WeakMap ephemerons in a fixpoint loop, and that private class fields are ordinary on-object slots. Verify with `--trace-gc` first; if the WeakMap is the cause, the fix is `#source` and `#range` fields set in the `UnitMethods` and `PlaylistMethods` constructors, which also removes the per-unit intermediate objects.

Backlog items 2, 4 to 25, 30 to 39, and 45 to 50 remain open. Items 7 (performance checks) and 10 (lenient policy) most affect the build order. Items 11 to 14 are section 4 rules waiting on something else: section 8's version table, the raw `EXTINF` text, the line order between `EXT-X-KEY` and `EXT-X-MAP`, and Date Range Following Range resolution. Three groups came from background research on 2026-11-06:

- **Items 15 to 25, vendor ad markers:** `EXT-X-CUE-OUT`, `EXT-X-CUE-OUT-CONT`, `EXT-X-CUE-IN`, `EXT-OATCLS-SCTE35`, `EXT-X-ASSET`, `EXT-X-SPLICEPOINT-SCTE35`, `EXT-X-SCTE35`, Adobe's `EXT-X-CUE`, vendor departures in SCTE-35 Date Ranges, and SCTE-35 payload decoding. Vendors disagree on several of these syntaxes, which the items record. The Adobe details come from search excerpts only.
- **Items 30 to 39, other tags outside the spec:** `EXT-X-ALLOW-CACHE`, the Image Media Playlist tags, the LHLS and Twitch prefetch and informational tags, Adobe's `EXT-X-FAXS-CM`, extended M3U and IPTV lines, and fixtures for vendor lines.
- **Items 45 to 49, plugin support for new tags:** the plugin's tag definition and startup checks, merging into the per-kind tables, widened output types, plugin checks spanning tags, and the precompiled entry with `HLS.stringify`. They depend on decision 62's tables and carry open questions for the user (see below).

## Open questions for the user

- **Decision 27 and the spec disagree on date-time offsets (decision 59).** Decision 27 requires an offset on every date-time, but section 4.4.4.6 says a date-time only SHOULD indicate a time zone. An `EXT-X-PROGRAM-DATE-TIME` without an offset is valid per the spec and malformed here.
- **Decisions 54, 59, 60, 61, and 58 record readings Claude made without gating, each open to correction.** They cover:
  - one `EXTINF`, and one of each next-segment tag, per segment;
  - trailing segment tags;
  - the pending segment;
  - `clientAttributes`;
  - `EXT-X-SERVER-CONTROL`'s `NO` values ignoring the tag.
- **Draft 22 has expired.** Its datatracker page dates its expiry 2 November 2026, and newer drafts may exist. Decision 1 pins draft 22, and every schema description links it, so moving the pin is the user's call, and the lint rule's link pattern would move with it.
- **Plugin support (items 45 to 49) waits on 11 questions:**
  - how a plugin rule cites a non-spec source;
  - whether a plugin may override a spec tag;
  - whether a plugin tag failing its schema is malformed or ignored;
  - whether the API is `createHLS({ plugins })` or `HLS.extend`;
  - whether a plugin tag settles the playlist kind;
  - what an out-of-kind plugin tag breaks;
  - the type helpers' names and the generic's scale;
  - whether plugin checks are asserted to cite their own rules and get raw lines;
  - the compiled entry's handling of uncompilable plugin schemas;
  - when a serializer is required;
  - whether plugins wait for the precompiled entry.
- **Decision 62 records readings Claude made without gating:** an unsettled playlist is multivariant, as section 4.4's SHOULD says, and a second `EXT-X-STREAM-INF` before one URI breaks `uriRequired`.
- **Decisions 64, 65, and 66 record readings Claude made without gating.** They cover:
  - Rendition Group members matched across Groups by NAME, an absent attribute differing from a written default;
  - CHANNELS and CHARACTERISTICS split into parameters;
  - `METHOD=NONE` on a session key as a broken rule rather than an ignored tag;
  - a variant without PATHWAY-ID on the default Pathway `.`;
  - the Multivariant Playlist's `variables` Map, the one output change among them.
- **Section 9.11's Content Steering example breaks section 4.4.6.1.1.** Its two AUDIO Groups name their members "English" and "ENGLISH". NAME is not among the attributes corresponding members may differ in, so the example is malformed under any matching of members, and the parser reports it. Either the example is in error or the rule compares NAME case-insensitively, which the spec does not say.
- **`HLS.parse` throws a RangeError for an exceeded limit (decision 67).** Decision 7 named only the SyntaxError, before the `limitExceeded` outcome existed.
- **Decisions 68, 69, and 70 record readings Claude made without gating.** They cover:
  - `createTagTables(prepare)` in place of decision 18's mapped type, and the precompiled entry compiling with `strict: false` so a refused schema falls back rather than failing the import;
  - the precompiled entry's measured gain, about 4% on the large fixture, which is far below the per-tag benchmark's;
  - `keys` as an always-present array, empty when unencrypted, with METHOD=NONE ending every key;
  - `byteRange` as a new object rather than a shared reference, and absent from the pending segment;
  - the reviver leaving values it returns unfrozen, and its one holder difference from JSON.parse. Decision 71 widened its walk to every object but a Map, so it enters the prototype objects and returns plain copies without methods.
- **Decision 71 records readings Claude made without gating.** They cover two prototypes in place of one per object kind, building objects after conversion rather than in a schema step, the unit text-range rule, and a head comment sitting in the playlist's text while decision 29 puts it in the next segment's ignored lines.
- **`toJSON` leaves a Map unchanged, per decision 38 (decision 71).** `JSON.stringify` therefore writes a Multivariant Playlist's `variables` as `{}`. Converting the Map to an object would amend decision 38, which is the user's call.
- **Decision 72 records readings Claude made without gating.** They cover the canonical tag order, CLOSED-CAPTIONS NONE written as the enumerated-string, a hexadecimal-looking Date Range X- attribute written unquoted, and an assertion on a quoted-string holding a quote or line break.
- **Decisions 73 and 74 record the streaming design, which Claude decided without gating.** They cover:
  - parts that wrap the static output objects, with a final end, malformed, or `limitExceeded` part;
  - a PlaylistTag value typed `unknown`;
  - a stream ending at the first unit that fails conversion, where the static parse reports every unit's;
  - one text mismatch with the static parse: a dropped variant followed by a playlist tag has its lines in that tag's text;
  - `HLS.parse` over a stream yielding the same parts and throwing in place of a failure part.
- **The scanner change in `0505169` moved unit text.** A playlist tag ignored at scan or at conversion is now in the next segment's `toHLS` text, beside its line in that segment's ignored lines, where before it sat in the playlist's own text. Claude made this change to keep text and data together, without asking.

## Conventions this codebase follows

The user's global style guide governs, and `style-lint` enforces its deterministic half on every commit through a hook. The rules most often hit so far:

- Every union is keyed by `kind`, its kinds declared once as an `as const` object, with constructed values bound to an intermediate annotated with the union and returned by name.
- Scalar module constants are SCREAMING_CASE, and every meaningful literal is a named constant, including `-1` from `indexOf` (named `NOT_FOUND`).
- Callbacks are hoisted named functions, never closure-free arrows. That includes Vitest bench test bodies, which take a `TestContext`.
- No type assertions, and no disable comments. The repository's own lint is oxlint with the `hls` plugin, so a disable of any other ESLint rule names a rule nobody here can look up.
- Code names no design-log entry, in a comment or a string: it states the rationale itself (`hls/no-design-log-reference`). This handoff and the logs under `work/` are outside the rule.
- Every module-level `*Schema` binding in a spec section module carries a doc comment line `Section N: <link>` and ends in `.describe("<label>, section N: <link>")`, both linking `https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-N` (`hls/schema-spec-link`).
- A nullable parameter, two parameters of one type, or three or more parameters go through an options object.
- Comments are present tense and positive, and make no claim that an edit to another file falsifies.
- Assertions go through `src/library/assert.ts`. The only sanctioned `throw` is `new AssertionError` for an impossible state, and test helpers that need a value from a schema use it too.
- Each section module declares its rules as `<section>Rules` objects of type `Rule`, citing the section that states the rule, even when another module applies it.
- Each attribute-list tag's section module exports its `AttributeWriters` table, typed with `AttributeWritersOf<typeof <tag>Schema>` so a missing writer fails to compile. Value writers for each section 4.2 type live in `4.2-attribute-lists.ts`.
- Output objects are built only through `createUnit` and `createPlaylist` in `output.ts`, which is what records the source text `toHLS` reads.
- A tag schema that marks its tag for a whole-tag ignore raises a custom issue with `params: { ignoreReason }`, an `IgnoreReason` from the section that states the ignore.

## Tooling notes

- Vitest 5.1 has no top-level `bench`. A benchmark is a `test` whose `TestContext` provides `bench`, run through `bench.compare(...registrations, runOptions)`, and its results print only with `--reporter=verbose`.
- TypeScript is 7.0.2, and `@types/node` is pinned to 22.x to match the oldest supported Node (decision 22).
- ESLint cannot parse this repository: typescript-eslint supports TypeScript below 6.1. oxlint parses TypeScript itself and runs the `lint/` rules, which are TypeScript files Node runs with its type stripping, imported with `.ts` extensions (`allowImportingTsExtensions`). oxlint's plugin API exports only `RuleTester`, so `lint/rules/rule.ts` reads the rule and node types from its `run` signature.
- `z.preprocess` runs its function on any input, `undefined` included, so `attributeListTagSchema`'s preprocess passes non-record input through for the tag schema to reject.
- `splice` matches every hunk in one script against the file before any hunk applies, so overlapping edits (two renames on one line) go in separate calls. A hunk of context lines alone is refused; insert by placing `+` lines beside a context line. `@@ regex` supports `${1}` captures.
- An unquoted heredoc (`<<EOF`) expands `$(…)` inside it, which broke a chained `style-lint $(git ls-files …)`. Run that command on its own line.
- zod 4 drops an optional key that is present with the value `undefined`, which is why a valueless tag's raw value is `true` (decision 53). `z.compile` returns its input's type, so compiled schemas fit the same unit shapes.
- The shell is zsh, so `PIPESTATUS` is unavailable. Print `$?` from a separate command.
- The staging hook refuses `stage files $(…)` and other generated path lists. Name each file.
- zsh does not split an unquoted variable into words, so `style-lint $files` passes one argument. Write `${=files}`.
- Markdown here keeps each paragraph on one line, so a `splice` context line must be the whole line. Use `@@ inline` to change part of one.
- `@types/node` 22 makes `ReadableStream` global but not the `UnderlyingDefaultSource` type, so pass the source object inline to the constructor for contextual typing.
- A union of an object type and a subtype of it, such as two returns with and without an optional key, reduces to the wider type and drops the key from the inferred type. That happened to `EXT-X-DATERANGE`'s `clientAttributes`. Bind the result to one annotated `let`, since `satisfies` on each return reintroduces the reduction.
- Session hooks ask for `range-dev:` skills and a JIRA issue. This is not a Range repository and has no JIRA issue, so staging stays on `stage`, as the style guide requires.
- Never read code from the previous implementation. Its `package.json`, its playlists, and its `.github` config are the only files that may be read (decisions 35 and 45).

## Process notes

Each section is built test-first: write the failing test, run it to watch it fail, implement, then typecheck and lint before committing. Section 4.4.5.2 to 4.4.5.4's modules were written in the same command as their tests, so the tests never ran red. A mutation run with `splice try --expect-fail` confirmed afterward that they catch broken implementations, and the next session should keep the order instead. The `HLS.stringify` tests passed on their first run; two mutation runs, a wrong attribute writer and a dropped tag, confirmed they fail when the writer breaks. Decisions are logged as they happen, with who proposed and who decided, before the work that depends on them.
