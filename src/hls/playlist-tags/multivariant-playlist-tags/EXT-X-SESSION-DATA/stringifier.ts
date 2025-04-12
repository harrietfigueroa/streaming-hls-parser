import { EXT_X_SESSION_DATA_PARSED, EXT_X_SESSION_DATA_STRING } from './types';

export default function (value: EXT_X_SESSION_DATA_PARSED): EXT_X_SESSION_DATA_STRING {
    const attrs = [];
    if (value['DATA-ID']) {
        attrs.push(`DATA="${value['DATA-ID']}"`);
    }
    if (value['VALUE']) {
        attrs.push(`VALUE="${value['VALUE']}"`);
    }
    if (value['URI']) {
        attrs.push(`URI="${value['URI']}"`);
    }
    if (value['LANGUAGE']) {
        attrs.push(`LANGUAGE="${value['LANGUAGE']}"`);
    }
    return `#EXT-X-SESSION-DATA:${attrs.join(',')}`;
}
