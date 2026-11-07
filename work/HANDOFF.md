# Handoff: streaming-hls-parser rebuild

This repository is a full rebuild of `github.com/harrietfigueroa/streaming-hls-parser`, published as `streaming-hls-parser` 0.2.0. Design is complete, and a minimal static path parses section 9.1's Media Playlist end to end through `HLS.safeParse`. Read this file first, then `work/decisions/decisions.jsonl` for the reasoning behind any rule below.

## Where things stand

The work is on the local branch `rebuild`, created from `origin/main` and not yet pushed. Shipping is a pull request into `main` that the user merges (decision 45).

| Commit | Content |
| --- | --- |
| `fde4fab` | Removes the previous implementation, unread (decision 35). |
| `6ede32d` | Adds the vendored spec, the decision log, and the backlog. |
| `94bc75c` | Adds package setup, assertion helpers, and the zod benchmark. |
| `f31b47a` | Records keeping zod for tag validation. |
| `95c228e` | Adds section 4.2: attribute lists and value types. |
| `a9ebac9` | Adds section 4.1: line splitting, line checks, and line classification. |
| `c962e55` | Adds section 4.3: variable substitution. |
| `692502f` | Adds section 4.4.1: `EXTM3U` and `EXT-X-VERSION`. |
| `ab08e6b` | Adds `EXT-X-TARGETDURATION`, `EXT-X-ENDLIST`, `EXTINF`, and the section-wide rules of 4.4.3 and 4.4.4. |
| `b37983c` | Adds `src/library/`: the tag table, the static scanner, the severity policy, `createHLS`, and the default entry `src/index.ts`. |

All 214 tests pass, `tsc --noEmit` is clean, and `style-lint` is clean on every committed file. The 11,701-segment fixture parses in about 16 ms median, against 3.1 ms for the benchmark's minimal loop (decision 48).

## Where to look

- `spec/draft-pantos-hls-rfc8216bis-22.txt` is the pinned spec (decision 1). Code mirrors its section numbering.
- `work/decisions/decisions.jsonl` holds 54 decisions. It is append-only: a correction is a new line with an `amends` field (decision 9). Decision 53 fixes the tag table's shape, and decision 54 records two spec readings open to the user's correction.
- `work/backlog/backlog.jsonl` is append-only too. The latest line for an `id` gives that item's current state.
- `src/<n>-<heading>/<n.n>-<heading>/…` holds one file per spec section (decision 33). `src/library/` holds code that belongs to no section.
- `tests/` mirrors `src/`. `tests/fixtures/very-large-playlist.m3u8` is the 11,701-segment real-world fixture.
- `bench/` holds the zod benchmark, kept to rerun against the real schemas once they exist (decision 47).

## Next steps

1. Continue through sections 4.4.2 to 4.4.6, one module per tag, each added to `src/library/tag-table.ts` with its rules. Attribute-list tags are the first to need a raw form beyond a string, which changes the scanner's `RawValue`. Multivariant Playlist tags need a second playlist kind and section 4.4.4's mixed-tags rule.
2. Extend `src/library/`: `HLS.parse` (decision 7), the precompiled entry (decisions 17 and 18; the composed segment schema compiles under `strict: true`), the streaming scanner (decisions 6 and 21), the options and limits (decision 30), prototypes and `toHLS` (decisions 42 and 43), resolved fields (decision 26), and the reviver (decision 20). `createHLS` is one line over the 70-line prompt, and its post-parse duration loop is the seam to cut once more cross-unit checks arrive.
3. Extract the spec's 15 embedded playlists into `tests/fixtures/` with a TypeScript script, and add one negative fixture per rule with a test that every rule has one (decision 32).
4. Add section barrels (decision 33) when a module outside a section first imports from it through a public surface. None exist yet.

Backlog items 2 and 4 to 12 remain open. Items 7 (performance checks) and 10 (lenient policy) most affect the build order. Items 11 and 12 are section 4 rules that wait on section 8's version table and on the raw EXTINF text.

## Conventions this codebase follows

The user's global style guide governs, and `style-lint` enforces its deterministic half on every commit through a hook. The rules most often hit so far:

- Every union is keyed by `kind`, its kinds declared once as an `as const` object, with constructed values bound to an intermediate annotated with the union and returned by name.
- Scalar module constants are SCREAMING_CASE, and every meaningful literal is a named constant, including `-1` from `indexOf` (named `NOT_FOUND`).
- Callbacks are hoisted named functions, never closure-free arrows. That includes Vitest bench test bodies, which take a `TestContext`.
- No type assertions, and no disable comments: this repository runs no ESLint of its own, so a disable would name a rule nobody here can look up. Calling `unreachable` in its test goes through `Reflect.apply` for this reason.
- Comments are present tense and positive. `style/no-history-comment` also flagged "Replaces" in a doc comment.
- Assertions go through `src/library/assert.ts` (`assertCondition`, `assertSchema`, `unreachable`). The only sanctioned `throw` is `new AssertionError` for an impossible state.
- Each section module declares its rules as `<section>Rules` objects of type `Rule` (`src/library/rule.ts`), citing the section that states the rule, even when another module applies it. For example, section 6.3.1's undefined-reference rule is applied in section 4.3.

## Tooling notes

- Vitest 5.1 has no top-level `bench`. A benchmark is a `test` whose `TestContext` provides `bench`, run through `bench.compare(...registrations, runOptions)`, and its results print only with `--reporter=verbose`. Imports read in a bench body cost an export getter on every call, so `bench/` reads each export once into a local.
- TypeScript is 7.0.2, and `@types/node` is pinned to 22.x to match the oldest supported Node (decision 22).
- `splice` literal hunks match whole lines. Use `@@ regex` (with `(?m)` for line anchors) to change part of a line.
- The shell is zsh, so `PIPESTATUS` is unavailable. Print `$?` from a separate command.
- The staging hook prints "nothing staged" when `stage files` and `git commit` share one command, because it inspects the index before the command runs. Confirm with `git show --stat HEAD`.
- Never read code from the previous implementation. Its `package.json`, its playlists, and its `.github` config are the only files that may be read (decisions 35 and 45).

## Process notes

Each section is built test-first: write the failing test, run it to watch it fail, implement, then typecheck and lint before committing. Section 4.3's implementation was written before its test had been run red, which skipped that step, and the next session should keep the order. Decisions the user makes are logged as they happen, with who proposed and who decided, before the work that depends on them.
