// Extracts the example playlists the pinned spec embeds. This module is pure:
// it reads the spec's text and returns each playlist with the section that
// shows it, so the fixture test can rerun it against the files it wrote.
//
// An example starts at an indented `#EXTM3U` line and runs over the indented
// lines after it until prose, a JSON body, or the next heading. Page furniture
// and blank lines are dropped. A line ending in a backslash, or indented past
// the example's own margin, continues the line before it, and the two join
// with nothing between them. A `...` line marks elided lines, which are dropped
// and make the example an excerpt.
import { assertCondition } from "../src/library/assert.ts";

const LINE_BREAK = "\n";
const FORM_FEED = "\f";
const CONTINUATION = "\\";
const ELISION = "...";
const EXAMPLE_START = "#EXTM3U";
const MARGIN = "   ";
const MARGIN_LENGTH = MARGIN.length;
// A heading at column 0: a section number such as `9.11.` or `D.6.`, or `Appendix D.`, then two spaces.
const HEADING_PATTERN = /^(?:Appendix )?([0-9A-Z]+(?:\.[0-9]+)*)\. {2}/u;
const PAGE_FOOTER_PATTERN = /^Pantos\s+Expires/u;
const PAGE_HEADER_PATTERN = /^Internet-Draft\s/u;
const JSON_OPENERS = ["{", "["] as const;
// The spec's longest example is under 200 lines, so an example past this is a misread boundary.
const EXAMPLE_LINE_COUNT_MAX = 1000;

/** One example playlist: the section showing it, its lines joined with line feeds, and whether lines were elided. */
export type SpecPlaylist = {
    readonly section: string;
    readonly text: string;
    readonly isExcerpt: boolean;
};

const LineKind = {
    skipped: "skipped",
    heading: "heading",
    indented: "indented",
    prose: "prose",
} as const;
type LineKind = (typeof LineKind)[keyof typeof LineKind];

function kindOfLine(line: string) {
    const isFurniture = PAGE_FOOTER_PATTERN.test(line) || PAGE_HEADER_PATTERN.test(line);
    const isBlank = line.trim().length === 0;
    if (isFurniture) {
        return LineKind.skipped;
    }
    if (isBlank) {
        return LineKind.skipped;
    }
    if (HEADING_PATTERN.test(line)) {
        return LineKind.heading;
    }
    if (line.startsWith(MARGIN)) {
        return LineKind.indented;
    }
    return LineKind.prose;
}

/** Whether an indented line's content, at the margin, can be a playlist line: a tag, or a URI with no space. */
function isPlaylistContent(content: string) {
    if (content.startsWith("#")) {
        return true;
    }
    for (const opener of JSON_OPENERS) {
        if (content.startsWith(opener)) {
            return false;
        }
    }
    return !content.includes(" ");
}

/** The section number a heading line names. */
function sectionOf(heading: string) {
    const match = HEADING_PATTERN.exec(heading);
    assertCondition(match !== null, `"${heading}" is not a heading.`);
    const section = match[1];
    assertCondition(section !== undefined, `"${heading}" names no section.`);
    return section;
}

/** Reads one example from `lines`, its `#EXTM3U` line at `startIndex`, returning its lines, its excerpt flag, and the index after it. */
function readExample(lines: readonly string[], startIndex: number) {
    const playlistLines: string[] = [EXAMPLE_START];
    let isExcerpt = false;
    let index = startIndex + 1;
    for (; index < lines.length; index += 1) {
        assertCondition(playlistLines.length < EXAMPLE_LINE_COUNT_MAX, `The example at line ${startIndex + 1} passes ${EXAMPLE_LINE_COUNT_MAX} lines.`);
        const line = lines[index];
        assertCondition(line !== undefined, `Line ${index + 1} is past the spec's end.`);
        const kind = kindOfLine(line);
        if (kind === LineKind.skipped) {
            continue;
        }
        if (kind !== LineKind.indented) {
            break;
        }
        const lastIndex = playlistLines.length - 1;
        const previous = playlistLines[lastIndex];
        assertCondition(previous !== undefined, "An example has no line before its continuation.");
        const content = line.slice(MARGIN_LENGTH);
        const continuesBackslash = previous.endsWith(CONTINUATION);
        const continuesIndent = content.startsWith(" ");
        if (continuesBackslash) {
            playlistLines[lastIndex] = previous.slice(0, -CONTINUATION.length) + content.trim();
        } else if (continuesIndent) {
            playlistLines[lastIndex] = previous + content.trim();
        } else if (content.startsWith(ELISION)) {
            isExcerpt = true;
        } else if (isPlaylistContent(content)) {
            playlistLines.push(content);
        } else {
            break;
        }
    }
    return { playlistLines, isExcerpt, nextIndex: index };
}

/**
 * Every example playlist in `specText`, in the spec's order. A lone `#EXTM3U`, such as a tag's
 * format line, is not an example.
 */
export function extractSpecPlaylists(specText: string) {
    const lines = specText.replaceAll(FORM_FEED, "").split(LINE_BREAK);
    const playlists: SpecPlaylist[] = [];
    let section: string | undefined;
    let index = 0;
    // Each pass reads at least one line, so the loop is bounded by the line count.
    while (index < lines.length) {
        const line = lines[index];
        assertCondition(line !== undefined, `Line ${index + 1} is past the spec's end.`);
        if (kindOfLine(line) === LineKind.heading) {
            section = sectionOf(line);
        }
        const isExampleStart = line === MARGIN + EXAMPLE_START;
        if (isExampleStart) {
            assertCondition(section !== undefined, `The example at line ${index + 1} precedes every heading.`);
            const example = readExample(lines, index);
            const hasPlaylistLines = example.playlistLines.length > 1;
            if (hasPlaylistLines) {
                const text = example.playlistLines.join(LINE_BREAK) + LINE_BREAK;
                playlists.push({ section, text, isExcerpt: example.isExcerpt });
            }
            index = example.nextIndex;
        } else {
            index += 1;
        }
    }
    return playlists;
}

/** The fixture file name for the example in `section`: `section-9.1.m3u8`, or `appendix-D.6.m3u8` for a lettered section. */
export function fixtureNameOf(section: string) {
    const isAppendix = /^[A-Z]/u.test(section);
    if (isAppendix) {
        return `appendix-${section}.m3u8`;
    }
    return `section-${section}.m3u8`;
}
