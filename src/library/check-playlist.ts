// The rules spanning a playlist's tags or units. This module is pure: a Media
// Playlist's units are added to a checker one at a time, which keeps only the
// facts the spanning rules read (each segment's duration, its key and part
// checks, and the previous byte range), so a parse that yields each unit as it
// completes can drop the unit. The playlist tags are read once, at the end.
import { checkMultivariantDefinitions } from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";
import { checkSegmentDuration } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { extXPartInfRules } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";
import { checkServerControl } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";
import { extXByteRangeRules } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import { checkKey } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import { checkPartDurations } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";
import { checkDateRanges } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.1-ext-x-daterange.js";
import { extXPreloadHintRules } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.3-ext-x-preload-hint.js";
import { checkRenditionReport } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.4-ext-x-rendition-report.js";
import { checkMedia } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import { checkRenditionGroups } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1.1-rendition-groups.js";
import { checkRenditionReferences } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";
import { checkAlternativeRendition } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2.1-alternative-renditions.js";
import { checkSessionData } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.4-ext-x-session-data.js";
import { checkSessionKeys } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.5-ext-x-session-key.js";
import { checkContentSteering } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.6-ext-x-content-steering.js";
import { assertCondition } from "./assert.js";
import { CheckKind, type Issue } from "./rule.js";
import type {
    ConvertedMediaPlaylist,
    ConvertedMediaSegment,
    ConvertedMultivariantPlaylist,
    ConvertedPendingSegment,
    ConvertedVariant,
} from "./schemas.js";

/** A Media Playlist's tags, without its units. */
export type MediaPlaylistTags = Omit<ConvertedMediaPlaylist, "segments" | "pendingSegment">;

/** A Multivariant Playlist's tags, without its variants. */
export type MultivariantPlaylistTags = Omit<ConvertedMultivariantPlaylist, "variants">;

type Parts = NonNullable<ConvertedMediaSegment["EXT-X-PART"]>;
type StreamInf = ConvertedVariant["EXT-X-STREAM-INF"];

/** What a unit leaves for the checks that read the playlist's tags: its key issues, and its parts, which need EXT-X-PART-INF. */
type UnitFacts = { readonly where: string; readonly keyIssues: readonly Issue[]; readonly parts: Parts | undefined };

/** The previous segment's byte range and URI, which an offset-less byte range follows. */
type PreviousSegment = { readonly hasByteRange: boolean; readonly uri: string };

function findKeyIssues(unit: ConvertedMediaSegment | ConvertedPendingSegment) {
    const issues: Issue[] = [];
    const keys = unit["EXT-X-KEY"];
    if (keys === undefined) {
        return issues;
    }
    for (const key of keys) {
        const keyIssues = checkKey(key);
        for (const issue of keyIssues) {
            issues.push(issue);
        }
    }
    return issues;
}

/** Finds the broken rules within one unit's parts, given the playlist's PART-TARGET, without its location. */
function findPartIssues(options: { readonly parts: Parts | undefined; readonly partTarget: number | undefined }) {
    const { parts, partTarget } = options;
    const issues: Issue[] = [];
    if (parts === undefined) {
        return issues;
    }
    if (partTarget === undefined) {
        issues.push({ rule: extXPartInfRules.requiredWithParts, detail: "It has EXT-X-PART, and the playlist no EXT-X-PART-INF." });
        return issues;
    }
    return checkPartDurations({ parts, partTarget });
}

/** Finds the broken rules of the units' facts, each at its unit, reporting a missing EXT-X-PART-INF once. */
function findUnitIssues(options: { readonly units: readonly UnitFacts[]; readonly partTarget: number | undefined }) {
    const issues: Issue[] = [];
    // A missing EXT-X-PART-INF is one broken rule however many segments have parts, so it is reported once.
    let hasReportedPartInf = false;
    for (const { where, keyIssues, parts } of options.units) {
        const partIssues = findPartIssues({ parts, partTarget: options.partTarget });
        for (const issue of [...keyIssues, ...partIssues]) {
            const isPartInfIssue = issue.rule === extXPartInfRules.requiredWithParts;
            const isRepeat = isPartInfIssue && hasReportedPartInf;
            if (isRepeat) {
                continue;
            }
            if (isPartInfIssue) {
                hasReportedPartInf = true;
            }
            issues.push({ rule: issue.rule, detail: `${where}: ${issue.detail}` });
        }
    }
    return issues;
}

/** Finds the broken rules of a Media Playlist's EXT-X-SERVER-CONTROL against its target durations. */
function findServerControlIssues(tags: MediaPlaylistTags) {
    const targetDuration = tags["EXT-X-TARGETDURATION"];
    const partTarget = tags["EXT-X-PART-INF"]?.["PART-TARGET"];
    const serverControl = tags["EXT-X-SERVER-CONTROL"];
    return checkServerControl({ serverControl, targetDuration, partTarget });
}

/** Finds the broken rules of a Media Playlist's metadata tags, which follow the byte range rule in report order. */
function findMetadataIssues(options: { readonly tags: MediaPlaylistTags; readonly hasProgramDateTime: boolean }) {
    const { tags, hasProgramDateTime } = options;
    const issues: Issue[] = [];
    const dateRanges = tags["EXT-X-DATERANGE"];
    if (dateRanges !== undefined) {
        const dateRangeIssues = checkDateRanges({ dateRanges, hasProgramDateTime });
        for (const issue of dateRangeIssues) {
            issues.push(issue);
        }
    }
    const isEndedWithHints = tags["EXT-X-ENDLIST"] === true && tags["EXT-X-PRELOAD-HINT"] !== undefined;
    if (isEndedWithHints) {
        issues.push({ rule: extXPreloadHintRules.notWithEndList, detail: "The playlist has EXT-X-ENDLIST and EXT-X-PRELOAD-HINT." });
    }
    const renditionReports = tags["EXT-X-RENDITION-REPORT"];
    if (renditionReports !== undefined) {
        for (const report of renditionReports) {
            const reportIssues = checkRenditionReport(report);
            for (const issue of reportIssues) {
                issues.push(issue);
            }
        }
    }
    return issues;
}

/**
 * Creates a checker for one Media Playlist. Each segment, then the pending segment, is added in
 * order, and `finish` reads the playlist's tags and returns every broken rule spanning tags or units.
 */
export function createMediaPlaylistChecker() {
    const durations: number[] = [];
    const units: UnitFacts[] = [];
    const byteRangeIssues: Issue[] = [];
    let previous: PreviousSegment | undefined;
    let hasProgramDateTime = false;
    let hasPending = false;

    function addUnit(unit: ConvertedMediaSegment | ConvertedPendingSegment, where: string) {
        const keyIssues = findKeyIssues(unit);
        const parts = unit["EXT-X-PART"];
        const hasFacts = keyIssues.length > 0 || parts !== undefined;
        if (hasFacts) {
            units.push({ where, keyIssues, parts });
        }
        if (unit["EXT-X-PROGRAM-DATE-TIME"] !== undefined) {
            hasProgramDateTime = true;
        }
    }

    function addSegment(segment: ConvertedMediaSegment) {
        assertCondition(!hasPending, "A segment was added after the pending segment.");
        const segmentIndex = durations.length;
        durations.push(segment.EXTINF.duration);
        addUnit(segment, `Segment ${segmentIndex + 1}`);
        const byteRange = segment["EXT-X-BYTERANGE"];
        const isOffsetless = byteRange !== undefined && byteRange.offset === undefined;
        if (isOffsetless) {
            const isSameResource = previous !== undefined && previous.uri === segment.uri;
            const followsSubRange = isSameResource && previous?.hasByteRange === true;
            if (!followsSubRange) {
                const detail = `Segment ${segmentIndex + 1} has no offset and follows no sub-range of ${segment.uri}.`;
                byteRangeIssues.push({ rule: extXByteRangeRules.offsetFollowsSubRange, detail });
            }
        }
        previous = { hasByteRange: byteRange !== undefined, uri: segment.uri };
    }

    function addPending(pending: ConvertedPendingSegment) {
        assertCondition(!hasPending, "A second pending segment was added.");
        hasPending = true;
        addUnit(pending, "The pending segment");
    }

    function finish(tags: MediaPlaylistTags) {
        const issues: Issue[] = [];
        const targetDuration = tags["EXT-X-TARGETDURATION"];
        for (const [segmentIndex, duration] of durations.entries()) {
            const check = checkSegmentDuration({ targetDuration, duration, segmentIndex });
            if (check.kind === CheckKind.failed) {
                issues.push(check.issue);
            }
        }
        const partTarget = tags["EXT-X-PART-INF"]?.["PART-TARGET"];
        const groups = [
            findUnitIssues({ units, partTarget }),
            findServerControlIssues(tags),
            byteRangeIssues,
            findMetadataIssues({ tags, hasProgramDateTime }),
        ];
        for (const group of groups) {
            for (const issue of group) {
                issues.push(issue);
            }
        }
        return issues;
    }

    return { addSegment, addPending, finish };
}

/** Finds every broken rule that spans a Multivariant Playlist's tags or its variants' EXT-X-STREAM-INF tags. */
export function findMultivariantPlaylistIssues(options: { readonly tags: MultivariantPlaylistTags; readonly streamInfs: readonly StreamInf[] }) {
    const { tags, streamInfs } = options;
    const issues: Issue[] = [];
    const defines = tags["EXT-X-DEFINE"];
    if (defines !== undefined) {
        const defineIssues = checkMultivariantDefinitions(defines);
        for (const issue of defineIssues) {
            issues.push(issue);
        }
    }
    let renditions: NonNullable<MultivariantPlaylistTags["EXT-X-MEDIA"]> = [];
    if (tags["EXT-X-MEDIA"] !== undefined) {
        renditions = tags["EXT-X-MEDIA"];
    }
    let iFrameStreamInfs: NonNullable<MultivariantPlaylistTags["EXT-X-I-FRAME-STREAM-INF"]> = [];
    if (tags["EXT-X-I-FRAME-STREAM-INF"] !== undefined) {
        iFrameStreamInfs = tags["EXT-X-I-FRAME-STREAM-INF"];
    }
    for (const [renditionIndex, media] of renditions.entries()) {
        const mediaIssues = checkMedia(media);
        const alternativeIssues = checkAlternativeRendition(media);
        const where = `Rendition ${renditionIndex + 1}`;
        for (const issue of [...mediaIssues, ...alternativeIssues]) {
            issues.push({ rule: issue.rule, detail: `${where}: ${issue.detail}` });
        }
    }
    const groupIssues = checkRenditionGroups(renditions);
    for (const issue of groupIssues) {
        issues.push(issue);
    }
    const referenceIssues = checkRenditionReferences({ streamInfs, iFrameStreamInfs, media: renditions });
    for (const issue of referenceIssues) {
        issues.push(issue);
    }
    const sessionData = tags["EXT-X-SESSION-DATA"];
    if (sessionData !== undefined) {
        const sessionDataIssues = checkSessionData(sessionData);
        for (const issue of sessionDataIssues) {
            issues.push(issue);
        }
    }
    const sessionKeys = tags["EXT-X-SESSION-KEY"];
    if (sessionKeys !== undefined) {
        const sessionKeyIssues = checkSessionKeys(sessionKeys);
        for (const issue of sessionKeyIssues) {
            issues.push(issue);
        }
    }
    const contentSteering = tags["EXT-X-CONTENT-STEERING"];
    if (contentSteering !== undefined) {
        const steeringIssues = checkContentSteering({ contentSteering, streamInfs });
        for (const issue of steeringIssues) {
            issues.push(issue);
        }
    }
    return issues;
}
