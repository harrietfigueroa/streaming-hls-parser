import { extXKeyStringifier } from '../../media-segment-tags/EXT-X-KEY/stringifier';
import { EXT_X_SESSION_KEY_PARSED, EXT_X_SESSION_KEY_STRING } from './types';

export function extXSessionKeyStringifier(value: EXT_X_SESSION_KEY_PARSED): EXT_X_SESSION_KEY_STRING {
    // Reuse the EXT-X-KEY stringifier since EXT-X-SESSION-KEY has the same structure
    const keyString = extXKeyStringifier(value);
    // Replace the tag name
    return keyString.replace('#EXT-X-KEY:', '#EXT-X-SESSION-KEY:') as EXT_X_SESSION_KEY_STRING;
}

export default extXSessionKeyStringifier;
