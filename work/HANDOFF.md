# Handoff: streaming-hls-parser rebuild

This repository is a full rebuild of `github.com/harrietfigueroa/streaming-hls-parser`, published as `streaming-hls-parser` 0.2.0. Design is complete. Every tag of section 4.4 parses through `HLS.safeParse`, in Media Playlists and Multivariant Playlists alike, and an `IMPORT` resolves against the `multivariant` option. The `src/library/` features of the next steps come next. Read this file first, then `work/decisions/decisions.jsonl` for the reasoning behind any rule below.

## Where things stand

The work is on the branch `rebuild`, created from `origin/main`, and is open as a pull request into `main` that the user merges (decision 45). All 637 tests pass, `tsc --noEmit` is clean, and `npm run lint` (oxlint) is clean. `style-lint` is clean on every committed file but the `HLS.parse(...)` calls in `tests/index.test.ts`, which `style/no-schema-parse` reports because it reads every `.parse(...)` call as zod's; the user chose to leave those findings open, and no disable comment names the rule, since the repository does not run `style-lint`.

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

## Where to look

- `spec/draft-pantos-hls-rfc8216bis-22.txt` is the pinned spec (decision 1). Code mirrors its section numbering.
- `work/decisions/decisions.jsonl` holds 66 decisions. It is append-only: a correction is a new line with an `amends` field (decision 9).
- `work/backlog/backlog.jsonl` is append-only too. The latest line for an `id` gives that item's current state.
- `lint/` holds the oxlint plugin (`plugin.ts`) and its rules under `lint/rules/`. `.oxlintrc.json` enables them, and `tests/lint/` tests them through oxlint's `RuleTester`.
- `src/<n>-<heading>/<n.n>-<heading>/…` holds one file per spec section (decision 33). A section that is a directory keeps its section-wide rules in a file named after it inside the directory (decision 54). `src/library/` holds code that belongs to no section.
- `tests/` mirrors `src/`. `tests/index.test.ts` tests the default entry end to end. `tests/fixtures/very-large-playlist.m3u8` is the 11,701-segment real-world fixture.
- `bench/` holds the zod benchmark, kept to rerun against the real schemas (decision 47).

## How the parser is built

A parse runs in three passes, each in its own module under `src/library/`:

1. `scan.ts` walks the lines once. It applies sections 4.1 and 4.4.1.1's line rules, parses attribute lists, substitutes variables, and resolves each `EXT-X-DEFINE` as it is read. It settles the playlist's kind at the first tag only one kind's table holds (`placeInUnsettledKind`, then `placeInSettledKind`), and groups each tag's raw value into the playlist, a unit (a segment or a variant), or the pending segment. Positional rules live here too: the out-of-kind rules, `precedesSegments`, `precedesParts`, and the discontinuity sequence's order.
2. `create-hls.ts` converts the raw playlist with one `safeParse` of its kind's playlist schema, built from `tag-table.ts`. `schema-issues.ts` maps each zod issue to its tag's format or required rule, or to an ignore reason. Ignored tags move into the ignored lines in position, a unit whose ignored tag has `ignoresUri` is dropped with its URI line, and the playlist converts once more (decision 55).
3. `findPlaylistIssues` in `create-hls.ts` runs the rules that span tags or units over the typed playlist, by its kind: `findMediaPlaylistIssues` or `findMultivariantPlaylistIssues`. Every issue resolves through `policy.ts` (decision 8).

`tag-table.ts` is the one place a tag is registered, in the table of its playlist kind: `media` (units are segments) or `multivariant` (units are variants), with sections 4.4.1 and 4.4.2's tags in both. Each entry gives its value form, its format rule, its occurrence, and any required, `precedesSegments`, `precedesParts`, `ignoreOnFormatFailure`, or `ignoresUri` rule. Each kind's table also names the rules its tags break in a playlist of the other kind. `createHLS` asserts at startup that a required rule is present exactly when the tag's schema rejects absence.

## Next steps

1. Extend `src/library/` with the rest:
   - the precompiled entry (decisions 17 and 18);
   - the streaming scanner (decisions 6 and 21);
   - prototypes and `toHLS` (decisions 42 and 43);
   - resolved fields (decision 26);
   - the reviver (decision 20).
2. Extract the spec's 15 embedded playlists into `tests/fixtures/` with a TypeScript script, and add one negative fixture per rule with a test that every rule has one (decision 32). Several examples are excerpts with `...` lines, which parse as URIs, so the script has to drop or mark them. Section 9.11's example breaks section 4.4.6.1.1 (see the open questions), and sections 9.6 and 9.7 write `CODECS="..."`, which parses as a quoted-string.
3. Add section barrels (decision 33) when a module outside a section first imports through a public surface. None exist yet.

Backlog items 2, 4 to 25, 30 to 39, and 45 to 49 remain open. Items 7 (performance checks) and 10 (lenient policy) most affect the build order. Items 11 to 14 are section 4 rules waiting on something else: section 8's version table, the raw `EXTINF` text, the line order between `EXT-X-KEY` and `EXT-X-MAP`, and Date Range Following Range resolution. Three groups came from background research on 2026-11-06:

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
- Never read code from the previous implementation. Its `package.json`, its playlists, and its `.github` config are the only files that may be read (decisions 35 and 45).

## Process notes

Each section is built test-first: write the failing test, run it to watch it fail, implement, then typecheck and lint before committing. Section 4.4.5.2 to 4.4.5.4's modules were written in the same command as their tests, so the tests never ran red. A mutation run with `splice try --expect-fail` confirmed afterward that they catch broken implementations, and the next session should keep the order instead. Decisions are logged as they happen, with who proposed and who decided, before the work that depends on them.
