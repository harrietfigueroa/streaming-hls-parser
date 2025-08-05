import { extXKeyParser } from '../../media-segment-tags/EXT-X-KEY/parser';
import { EXT_X_SESSION_KEY_PARSED, EXT_X_SESSION_KEY_STRING } from './types';

// Generic parser type for type inference
type ExtXSessionKeyParser<T extends string> = T extends EXT_X_SESSION_KEY_STRING ? EXT_X_SESSION_KEY_PARSED : never;

export function extXSessionKeyParser<T extends string>(str: T): ExtXSessionKeyParser<T> {
    // Reuse the EXT-X-KEY parser since EXT-X-SESSION-KEY has the same structure
    return extXKeyParser(str) as ExtXSessionKeyParser<T>;
}

export default extXSessionKeyParser;
