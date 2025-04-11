import { isDefined } from '../../../../helpers/isDefined';
import { EXT_X_KEY_PARSED, EXT_X_KEY_STRING } from './types';

export default function (val: EXT_X_KEY_PARSED) {
    const METHOD = val.METHOD;
    const URI = val.URI;
    const IV = val.IV;
    const KEYFORMAT = val.KEYFORMAT;
    const KEYFORMATVERSIONS = val.KEYFORMATVERSIONS;

    const attrs = [`METHOD=${METHOD}`];
    if (URI) {
        attrs.push(`URI="${URI}"`);
    }
    if (IV) {
        attrs.push(`IV=${IV}`);
    }
    if (KEYFORMAT) {
        attrs.push(`KEYFORMAT="${KEYFORMAT}"`);
    }
    if (KEYFORMATVERSIONS) {
        attrs.push(`KEYFORMATVERSIONS="${KEYFORMATVERSIONS}"`);
    }

    return `#EXT-X-KEY:${attrs}` as const satisfies EXT_X_KEY_STRING;
}
