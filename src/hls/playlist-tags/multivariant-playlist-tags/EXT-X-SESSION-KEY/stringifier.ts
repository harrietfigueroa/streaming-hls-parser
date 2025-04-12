import { EXT_X_SESSION_KEY_PARSED, EXT_X_SESSION_KEY_STRING } from './types';

export default function (val: EXT_X_SESSION_KEY_PARSED): EXT_X_SESSION_KEY_STRING {
    const attrs = [];
    if (val['METHOD']) {
        attrs.push(`METHOD=${val['METHOD']}`);
    }
    if (val['URI']) {
        attrs.push(`URI="${val['URI']}"`);
    }
    if (val['IV']) {
        attrs.push(`IV=${val['IV']}`);
    }
    if (val['KEYFORMAT']) {
        attrs.push(`KEYFORMAT="${val['KEYFORMAT']}"`);
    }
    if (val['KEYFORMATVERSIONS']) {
        attrs.push(`KEYFORMATVERSIONS="${val['KEYFORMATVERSIONS']}"`);
    }

    return `#EXT-X-SESSION-KEY:${attrs.join(',')}`;
}
