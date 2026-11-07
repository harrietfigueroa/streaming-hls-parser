// These tests pin the example playlists of the pinned spec: the extraction's
// line rules on small inputs, the fixture files against a fresh extraction of
// the spec, and each example's parse outcome, a broken rule named for each
// example that does not parse.
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { extXPartInfRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";
import { extXTargetDurationRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { renditionGroupRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1.1-rendition-groups.js";
import { HLS, ParseKind, type Rule } from "../src/index.js";
import { extractSpecPlaylists, fixtureNameOf } from "../scripts/spec-playlists.js";

const SPEC_PATH = new URL("../spec/draft-pantos-hls-rfc8216bis-22.txt", import.meta.url);
const FIXTURES_DIRECTORY = new URL("./fixtures/spec/", import.meta.url);
const ENCODING = "utf8";

/** The fixture file of the example in `section`. */
function readFixture(section: string) {
    const path = new URL(fixtureNameOf(section), FIXTURES_DIRECTORY);
    return readFileSync(path, { encoding: ENCODING });
}

const extractions = [
    {
        name: "reads the indented lines after a heading's #EXTM3U",
        spec: "9.1.  Simple\n\n   #EXTM3U\n   #EXTINF:1,\n   a.ts\n",
        expected: [{ section: "9.1", text: "#EXTM3U\n#EXTINF:1,\na.ts\n", isExcerpt: false }],
    },
    {
        name: "joins a line ending in a backslash to the next with nothing between",
        spec: '9.6.  Audio\n   #EXTM3U\n   #EXT-X-MEDIA:TYPE=AUDIO,\\\n      NAME="a"\n',
        expected: [{ section: "9.6", text: '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,NAME="a"\n', isExcerpt: false }],
    },
    {
        name: "joins a line indented past the margin to the line before it",
        spec: 'D.6.  Example\n   #EXTM3U\n   #EXT-X-DATERANGE:ID="a",\n       DURATION=1\n',
        expected: [{ section: "D.6", text: '#EXTM3U\n#EXT-X-DATERANGE:ID="a",DURATION=1\n', isExcerpt: false }],
    },
    {
        name: "drops elided lines and marks the example an excerpt",
        spec: "9.10.  Excerpt\n   #EXTM3U\n   ...\n   #EXT-X-ENDLIST\n   ... more lines here\n",
        expected: [{ section: "9.10", text: "#EXTM3U\n#EXT-X-ENDLIST\n", isExcerpt: true }],
    },
    {
        name: "ends an example at prose, keeping page furniture and blank lines out",
        spec: "2.  Overview\n   #EXTM3U\n\nPantos   Expires 2 November 2026\nInternet-Draft  HLS\n   a.ts\n   The first line is the tag.\n   b.ts\n",
        expected: [{ section: "2", text: "#EXTM3U\na.ts\n", isExcerpt: false }],
    },
    {
        name: "ends an example at a JSON body",
        spec: "9.12.  Steering\n   #EXTM3U\n   a.m3u8\n   {\n",
        expected: [{ section: "9.12", text: "#EXTM3U\na.m3u8\n", isExcerpt: false }],
    },
    {
        name: "ends an example at the next heading",
        spec: "9.1.  One\n   #EXTM3U\n   a.ts\n9.2.  Two\n   #EXTM3U\n   b.ts\n",
        expected: [
            { section: "9.1", text: "#EXTM3U\na.ts\n", isExcerpt: false },
            { section: "9.2", text: "#EXTM3U\nb.ts\n", isExcerpt: false },
        ],
    },
    {
        name: "skips a lone #EXTM3U, such as a tag's format line",
        spec: "4.4.1.1.  EXTM3U\n   Its format is:\n   #EXTM3U\n   The EXTM3U tag comes first.\n",
        expected: [],
    },
] as const;

describe("extractSpecPlaylists", () => {
    test.each(extractions)("$name", ({ spec, expected }) => {
        expect(extractSpecPlaylists(spec)).toStrictEqual(expected);
    });

    test("names a numbered section's fixture section- and a lettered one appendix-", () => {
        expect([fixtureNameOf("9.11"), fixtureNameOf("D.6")]).toStrictEqual(["section-9.11.m3u8", "appendix-D.6.m3u8"]);
    });
});

describe("the spec's example playlists", () => {
    const specText = readFileSync(SPEC_PATH, { encoding: ENCODING });
    const playlists = extractSpecPlaylists(specText);

    test("are the fixture files, one per example, as the pinned spec writes them", () => {
        const names: string[] = [];
        for (const playlist of playlists) {
            names.push(fixtureNameOf(playlist.section));
        }
        const written = readdirSync(FIXTURES_DIRECTORY);
        // Both lists are sorted copies, since readdirSync's order is the file system's.
        expect(Array.from(written).sort()).toStrictEqual(Array.from(names).sort());
        for (const playlist of playlists) {
            expect(readFixture(playlist.section)).toBe(playlist.text);
        }
    });

    test("mark sections 9.10 and 9.11, which elide lines, as excerpts", () => {
        const excerptSections: string[] = [];
        for (const playlist of playlists) {
            if (playlist.isExcerpt) {
                excerptSections.push(playlist.section);
            }
        }
        expect(excerptSections).toStrictEqual(["9.10", "9.11"]);
    });

    const parsedSections = ["2", "9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "D.6", "D.7"] as const;

    test.each(parsedSections)("parse section %s's example", (section) => {
        const outcome = HLS.safeParse(readFixture(section));
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, violations: [] });
    });

    const malformedSections: readonly { readonly section: string; readonly reason: string; readonly rule: Rule }[] = [
        { section: "9.10", reason: "its elided lines hold the EXT-X-TARGETDURATION", rule: extXTargetDurationRules.required },
        { section: "9.11", reason: "its elided lines hold the EXT-X-PART-INF", rule: extXPartInfRules.requiredWithParts },
        { section: "9.12", reason: "its corresponding AUDIO members are named English and ENGLISH", rule: renditionGroupRules.matchingGroups },
        { section: "G.2", reason: "its audio Group has two members with DEFAULT=YES", rule: renditionGroupRules.singleDefault },
    ];

    test.each(malformedSections)("report section $section's example malformed, since $reason", ({ section, rule }) => {
        const outcome = HLS.safeParse(readFixture(section));
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: expect.arrayContaining([expect.objectContaining({ rule })]) });
    });
});
