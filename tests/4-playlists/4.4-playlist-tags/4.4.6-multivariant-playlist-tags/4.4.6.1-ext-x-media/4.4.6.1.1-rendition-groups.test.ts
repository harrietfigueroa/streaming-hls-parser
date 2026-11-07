// These tests pin section 4.4.6.1.1: the tags sharing a TYPE and GROUP-ID form
// a Group whose members have distinct NAMEs and at most one DEFAULT=YES, and
// Groups of one TYPE match member for member, by NAME, in all but the
// attributes the section exempts. Each case breaks one rule once.
import { describe, expect, test } from "vitest";

import { MediaType, YesNo } from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import {
    checkRenditionGroups,
    renditionGroupRules,
} from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1.1-rendition-groups.js";

// Section 9.6's audio Group.
const english = { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "English", DEFAULT: YesNo.yes, AUTOSELECT: YesNo.yes, LANGUAGE: "en", URI: "main/english-audio.m3u8" } as const;
const deutsch = { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "Deutsch", DEFAULT: YesNo.no, AUTOSELECT: YesNo.yes, LANGUAGE: "de", URI: "main/german-audio.m3u8" } as const;
const commentary = { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "Commentary", DEFAULT: YesNo.no, AUTOSELECT: YesNo.no, LANGUAGE: "en", URI: "commentary/audio-only.m3u8" } as const;

// Section 9.7's video Groups, one per bandwidth tier.
function videoRendition(options: { readonly groupId: string; readonly name: string; readonly isDefault: boolean }) {
    let isDefault: YesNo = YesNo.no;
    if (options.isDefault) {
        isDefault = YesNo.yes;
    }
    const uri = `${options.groupId}/${options.name.toLowerCase()}/audio-video.m3u8`;
    return { TYPE: MediaType.video, "GROUP-ID": options.groupId, NAME: options.name, DEFAULT: isDefault, URI: uri } as const;
}

function videoGroup(groupId: string) {
    const main = videoRendition({ groupId, name: "Main", isDefault: true });
    const centerfield = videoRendition({ groupId, name: "Centerfield", isDefault: false });
    const dugout = videoRendition({ groupId, name: "Dugout", isDefault: false });
    return [main, centerfield, dugout] as const;
}

const lowVideo = videoGroup("low");
const midVideo = videoGroup("mid");

describe("checkRenditionGroups", () => {
    test("accepts section 9.6's audio Group", () => {
        expect(checkRenditionGroups([english, deutsch, commentary])).toEqual([]);
    });

    test("accepts section 9.7's video Groups, which differ only in URI", () => {
        const hiVideo = videoGroup("hi");
        const media = [...lowVideo, ...midVideo, ...hiVideo];
        expect(checkRenditionGroups(media)).toEqual([]);
    });

    test("accepts a NAME repeated across Groups of different TYPEs", () => {
        const subtitles = { TYPE: MediaType.subtitles, "GROUP-ID": "aac", NAME: "English", URI: "en.m3u8" } as const;
        expect(checkRenditionGroups([english, subtitles])).toEqual([]);
    });

    test("accepts corresponding members differing only in the exempt attributes and unrecognized ones", () => {
        const stereo = { ...english, CHANNELS: { count: 2n }, "BIT-DEPTH": 16n, "SAMPLE-RATE": 44100n, "STABLE-RENDITION-ID": "a", "INSTREAM-ID": "1" } as const;
        const surround = {
            ...english,
            "GROUP-ID": "ac3",
            URI: "main/english-ac3.m3u8",
            CHANNELS: { count: 6n },
            "BIT-DEPTH": 24n,
            "SAMPLE-RATE": 48000n,
            "STABLE-RENDITION-ID": "b",
            "INSTREAM-ID": "2",
            ignored: ['X-VENDOR="1"'],
        } as const;
        expect(checkRenditionGroups([stereo, surround])).toEqual([]);
    });

    const broken = [
        { name: "two members with one NAME", media: [english, { ...deutsch, NAME: "English" }], rule: renditionGroupRules.distinctNames },
        { name: "two DEFAULT=YES members", media: [english, { ...deutsch, DEFAULT: YesNo.yes }], rule: renditionGroupRules.singleDefault },
        { name: "a Group lacking a member of another of its TYPE", media: [...lowVideo, ...midVideo.slice(0, 2)], rule: renditionGroupRules.matchingGroups },
        {
            name: "a Group with a member another of its TYPE lacks",
            media: [...lowVideo, ...midVideo, videoRendition({ groupId: "mid", name: "Blimp", isDefault: false })],
            rule: renditionGroupRules.matchingGroups,
        },
        {
            name: "corresponding members whose LANGUAGE differs",
            media: [english, { ...english, "GROUP-ID": "ac3", LANGUAGE: "en-US" }],
            rule: renditionGroupRules.matchingGroups,
        },
        {
            name: "corresponding members where only one has AUTOSELECT",
            media: [{ TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "Commentary" }, { TYPE: MediaType.audio, "GROUP-ID": "ac3", NAME: "Commentary", AUTOSELECT: YesNo.no }],
            rule: renditionGroupRules.matchingGroups,
        },
    ] as const;

    test.each(broken)("reports $name", ({ media, rule }) => {
        expect(checkRenditionGroups(media)).toMatchObject([{ rule }]);
    });
});
