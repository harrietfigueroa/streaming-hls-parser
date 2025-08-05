import { ValidationError } from '../../../validation-helpers/validator.types';
import { EXT_X_KEY_PARSED } from '../../media-segment-tags/EXT-X-KEY/types';

/**
 * The EXT-X-SESSION-KEY tag allows encryption keys from Media Playlists
   to be specified in a Master Playlist.  This allows the client to
   preload these keys without having to read the Media Playlist(s)
   first.

   Its format is:

   #EXT-X-SESSION-KEY:<attribute-list>

   All attributes defined for the EXT-X-KEY tag (Section 4.3.2.4) are
   also defined for the EXT-X-SESSION-KEY, except that the value of the
   METHOD attribute MUST NOT be NONE.  If an EXT-X-SESSION-KEY is used,
   the values of the METHOD, KEYFORMAT, and KEYFORMATVERSIONS attributes
   MUST match any EXT-X-KEY with the same URI value.

   EXT-X-SESSION-KEY tags SHOULD be added if multiple Variant Streams or
   Renditions use the same encryption keys and formats.  An EXT-X-
   SESSION-KEY tag is not associated with any particular Media Playlist.

   A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY
   tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS
   attribute values.

   The EXT-X-SESSION-KEY tag is optional.
 */
export interface EXT_X_SESSION_KEY_PARSED extends EXT_X_KEY_PARSED { }

export type EXT_X_SESSION_KEY_STRING = `#EXT-X-SESSION-KEY:${string}`;

// Generic parser type for type inference
type ExtXSessionKeyParser<T extends string> = T extends EXT_X_SESSION_KEY_STRING ? EXT_X_SESSION_KEY_PARSED : never;

// Error interfaces
export interface ExtXSessionKeyValidationError extends ValidationError {
  type: 'ExtXSessionKeyMethodNoneError';
}

export interface ExtXSessionKeyValidationResult {
  tagName: '#EXT-X-SESSION-KEY';
  errors: ExtXSessionKeyValidationError[];
  isValid: boolean;
}

export type ExtXSessionKeyValidationErrorUnion = ExtXSessionKeyValidationError;

// Concrete error classes
export class ExtXSessionKeyMethodNoneError extends Error implements ExtXSessionKeyValidationError {
  readonly type = 'ExtXSessionKeyMethodNoneError';
  readonly description = 'METHOD attribute MUST NOT be NONE according to RFC 8216 Section 4.3.4.2.3';

  constructor(public readonly invalidValue: any) {
    super('METHOD attribute MUST NOT be NONE');
    this.name = 'ExtXSessionKeyMethodNoneError';
  }
}
