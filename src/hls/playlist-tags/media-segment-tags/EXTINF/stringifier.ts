import { EXTINF_PARSED } from './types';

export function extinfStringifier(val: EXTINF_PARSED): string {
    // Use original duration format if available, otherwise format the number
    const DURATION = val._originalDuration || val.DURATION.toString();
    const TITLE = val.TITLE;
    // The comma should always be present, even if there is no title.
    const attrs = [`${DURATION},`];
    if (TITLE) {
        attrs.push(`${TITLE}`);
    }
    return `#EXTINF:${attrs.join('')}`;
} 