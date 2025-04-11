import { EXTINF_PARSED } from './types';

export default function (val: EXTINF_PARSED) {
    const DURATION = val.DURATION;
    const TITLE = val.TITLE;
    // The comma should always be present, even if there is no title.
    const attrs = [`${DURATION},`];
    if (TITLE) {
        attrs.push(`${TITLE}`);
    }
    return `#EXTINF:${attrs.join('')}` as const satisfies string;
}
