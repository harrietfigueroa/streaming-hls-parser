// Section 4.4.6.1.1, Rendition Groups. This module is pure: it groups a
// playlist's Renditions by TYPE and GROUP-ID and checks the rules the section
// sets within one Group and between the Groups of one TYPE.
import { type Issue, type Rule, Severity } from "../../../../library/rule.js";
import { type Media, type MediaType, YesNo } from "./4.4.6.1-ext-x-media.js";

const SECTION = "4.4.6.1.1";

export const renditionGroupRules = {
    distinctNames: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-MEDIA tags of one Group have different NAME attributes.",
    },
    singleDefault: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Group has at most one member with DEFAULT=YES.",
    },
    matchingGroups: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "Groups of one TYPE have the same members, each with identical attributes but URI, CHANNELS, BIT-DEPTH, STABLE-RENDITION-ID, INSTREAM-ID, and SAMPLE-RATE.",
    },
} as const satisfies Record<string, Rule>;

// GROUP-ID differs between Groups by definition, and unrecognized attributes are ignored whole.
const EXEMPT_ATTRIBUTES: ReadonlySet<string> = new Set([
    "GROUP-ID",
    "URI",
    "CHANNELS",
    "BIT-DEPTH",
    "STABLE-RENDITION-ID",
    "INSTREAM-ID",
    "SAMPLE-RATE",
    "ignored",
]);

type Group = { readonly groupId: string; readonly members: ReadonlyMap<string, Media> };

/** Checks every Group the Renditions form, and every pair of Groups of one TYPE. */
export function checkRenditionGroups(renditions: Iterable<Media>) {
    const issues: Issue[] = [];
    const membersByType = new Map<MediaType, Map<string, Media[]>>();
    for (const media of renditions) {
        let groups = membersByType.get(media.TYPE);
        if (groups === undefined) {
            groups = new Map();
            membersByType.set(media.TYPE, groups);
        }
        let members = groups.get(media["GROUP-ID"]);
        if (members === undefined) {
            members = [];
            groups.set(media["GROUP-ID"], members);
        }
        members.push(media);
    }
    for (const [type, groupsById] of membersByType) {
        const groups: Group[] = [];
        for (const [groupId, members] of groupsById) {
            const groupIssues = checkGroup({ type, groupId, members });
            for (const issue of groupIssues) {
                issues.push(issue);
            }
            groups.push({ groupId, members: toMembersByName(members) });
        }
        const [reference, ...others] = groups;
        if (reference === undefined) {
            continue;
        }
        for (const other of others) {
            const matchIssues = checkMatchingGroups({ type, reference, other });
            for (const issue of matchIssues) {
                issues.push(issue);
            }
        }
    }
    return issues;
}

function checkGroup(options: { readonly type: MediaType; readonly groupId: string; readonly members: readonly Media[] }) {
    const { type, groupId, members } = options;
    const issues: Issue[] = [];
    const names = new Set<string>();
    let defaultCount = 0;
    for (const member of members) {
        if (names.has(member.NAME)) {
            const detail = `${type} Group "${groupId}" has two members named "${member.NAME}".`;
            issues.push({ rule: renditionGroupRules.distinctNames, detail });
        }
        names.add(member.NAME);
        if (member.DEFAULT === YesNo.yes) {
            defaultCount += 1;
        }
    }
    if (defaultCount > 1) {
        const detail = `${type} Group "${groupId}" has ${defaultCount} members with DEFAULT=YES.`;
        issues.push({ rule: renditionGroupRules.singleDefault, detail });
    }
    return issues;
}

// A repeated NAME breaks distinctNames, so the first member of each NAME stands for it here.
function toMembersByName(members: readonly Media[]) {
    const membersByName = new Map<string, Media>();
    for (const member of members) {
        if (!membersByName.has(member.NAME)) {
            membersByName.set(member.NAME, member);
        }
    }
    return membersByName;
}

/** Checks that `other` has `reference`'s members, by NAME, with the same non-exempt attributes. */
function checkMatchingGroups(options: { readonly type: MediaType; readonly reference: Group; readonly other: Group }) {
    const { type, reference, other } = options;
    const issues: Issue[] = [];
    const where = `${type} Groups "${reference.groupId}" and "${other.groupId}"`;
    for (const [name, member] of reference.members) {
        const counterpart = other.members.get(name);
        if (counterpart === undefined) {
            issues.push({ rule: renditionGroupRules.matchingGroups, detail: `${where}: only the first has "${name}".` });
            continue;
        }
        const differing = differingAttributes({ source: member, target: counterpart });
        if (differing.length > 0) {
            const detail = `${where}: "${name}" differs in ${differing.join(", ")}.`;
            issues.push({ rule: renditionGroupRules.matchingGroups, detail });
        }
    }
    for (const name of other.members.keys()) {
        if (!reference.members.has(name)) {
            issues.push({ rule: renditionGroupRules.matchingGroups, detail: `${where}: only the second has "${name}".` });
        }
    }
    return issues;
}

/** The non-exempt attributes whose converted values differ between two Renditions, absence included. */
function differingAttributes(options: { readonly source: Media; readonly target: Media }) {
    const { source, target } = options;
    const sourceValues: ReadonlyMap<string, unknown> = new Map(Object.entries(source));
    const targetValues: ReadonlyMap<string, unknown> = new Map(Object.entries(target));
    const names = new Set(sourceValues.keys());
    for (const name of targetValues.keys()) {
        names.add(name);
    }
    const differing: string[] = [];
    for (const name of names) {
        if (EXEMPT_ATTRIBUTES.has(name)) {
            continue;
        }
        const isEqual = areAttributeValuesEqual({ source: sourceValues.get(name), target: targetValues.get(name) });
        if (!isEqual) {
            differing.push(name);
        }
    }
    return differing;
}

// CHARACTERISTICS is the one compared attribute whose value is an array; every other is a string or bigint.
function areAttributeValuesEqual(options: { readonly source: unknown; readonly target: unknown }) {
    const { source, target } = options;
    const areArrays = Array.isArray(source) && Array.isArray(target);
    if (!areArrays) {
        return source === target;
    }
    if (source.length !== target.length) {
        return false;
    }
    for (const [index, element] of source.entries()) {
        if (element !== target[index]) {
            return false;
        }
    }
    return true;
}
