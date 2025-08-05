import { EXT_X_MEDIA_PARSED, EXT_X_MEDIA_STRING } from './types';

export function extXMediaStringifier(value: EXT_X_MEDIA_PARSED): EXT_X_MEDIA_STRING {
    const attrs = [];
    if (value['TYPE']) {
        attrs.push(`TYPE=${value['TYPE']}`);
    }
    if (value['URI']) {
        attrs.push(`URI="${value['URI']}"`);
    }
    if (value['GROUP-ID']) {
        attrs.push(`GROUP-ID="${value['GROUP-ID']}"`);
    }
    if (value['LANGUAGE']) {
        attrs.push(`LANGUAGE="${value['LANGUAGE']}"`);
    }
    if (value['ASSOC-LANGUAGE']) {
        attrs.push(`ASSOC-LANGUAGE="${value['ASSOC-LANGUAGE']}"`);
    }
    if (value['NAME']) {
        attrs.push(`NAME="${value['NAME']}"`);
    }
    if (value['DEFAULT']) {
        attrs.push(`DEFAULT=${value['DEFAULT']}`);
    }
    if (value['AUTOSELECT']) {
        attrs.push(`AUTOSELECT=${value['AUTOSELECT']}`);
    }
    if (value['FORCED']) {
        attrs.push(`FORCED=${value['FORCED']}`);
    }
    if (value['INSTREAM-ID']) {
        attrs.push(`INSTREAM-ID="${value['INSTREAM-ID']}"`);
    }
    if (value['CHARACTERISTICS']) {
        attrs.push(`CHARACTERISTICS="${value['CHARACTERISTICS']}"`);
    }
    if (value['CHANNELS']) {
        attrs.push(`CHANNELS="${value['CHANNELS']}"`);
    }
    return `#EXT-X-MEDIA:${attrs.join(',')}`;
}

export default extXMediaStringifier;
