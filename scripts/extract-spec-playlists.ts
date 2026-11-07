// Writes each example playlist of the pinned spec to tests/fixtures/spec/,
// named by its section. Rerun it whenever the pinned spec changes:
// node scripts/extract-spec-playlists.ts
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { extractSpecPlaylists, fixtureNameOf } from "./spec-playlists.ts";

const SPEC_PATH = new URL("../spec/draft-pantos-hls-rfc8216bis-22.txt", import.meta.url);
const FIXTURES_DIRECTORY = new URL("../tests/fixtures/spec/", import.meta.url);
const ENCODING = "utf8";

const specText = readFileSync(SPEC_PATH, { encoding: ENCODING });
const playlists = extractSpecPlaylists(specText);
// The directory is rewritten whole, so an example the spec no longer has leaves no stale file.
rmSync(FIXTURES_DIRECTORY, { recursive: true, force: true });
mkdirSync(FIXTURES_DIRECTORY, { recursive: true });
for (const playlist of playlists) {
    const path = new URL(fixtureNameOf(playlist.section), FIXTURES_DIRECTORY);
    writeFileSync(path, playlist.text, { encoding: ENCODING });
}
