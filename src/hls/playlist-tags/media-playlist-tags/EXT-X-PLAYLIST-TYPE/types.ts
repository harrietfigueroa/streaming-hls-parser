/**
 * The EXT-X-PLAYLIST-TYPE tag provides mutability information about the
   Media Playlist file.  It applies to the entire Media Playlist file.
   It is OPTIONAL.  Its format is:

   #EXT-X-PLAYLIST-TYPE:<type-enum>

   where type-enum is either EVENT or VOD.

   Section 6.2.1 defines the implications of the EXT-X-PLAYLIST-TYPE
   tag.

   If the EXT-X-PLAYLIST-TYPE value is EVENT, Media Segments can only be
   added to the end of the Media Playlist.  If the EXT-X-PLAYLIST-TYPE
   value is Video On Demand (VOD), the Media Playlist cannot change.

   If the EXT-X-PLAYLIST-TYPE tag is omitted from a Media Playlist, the
   Playlist can be updated according to the rules in Section 6.2.1 with
   no additional restrictions.  For example, a live Playlist
   (Section 6.2.2) MAY be updated to remove Media Segments in the order
   that they appeared.
 */
export type EXT_X_PLAYLIST_TYPE_PARSED = PlaylistTypeValues | undefined;
export type EXT_X_PLAYLIST_TYPE_STRING<playlistType extends PlaylistTypeValues> = `#EXT-X-PLAYLIST-TYPE:${playlistType}`;

export const PlaylistTypes = {
  /**
   * If the EXT-X-PLAYLIST-TYPE value is EVENT, Media Segments can only be added to the end of the Media Playlist.
   */
  EVENT: 'EVENT',
  /**
   * If the EXT-X-PLAYLIST-TYPE value is Video On Demand (VOD), the Media Playlist cannot change.
   */
  VOD: 'VOD',
} as const;

export type PlaylistTypeValues = (typeof PlaylistTypes)[keyof typeof PlaylistTypes];

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';



// Abstract validation error class for this tag
export abstract class ExtXPlaylistTypeValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-PLAYLIST-TYPE';
}

// Concrete validation error classes
export class EXTXPLAYLISTTYPENotStringOrNullError extends ExtXPlaylistTypeValidationError {
  readonly type: ValidationErrorType = 'not-string-or-null';
  readonly tagName = '#EXT-X-PLAYLIST-TYPE';
  readonly description = 'EXT-X-PLAYLIST-TYPE value must be a string or undefined (RFC 8216 Section 4.3.3.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXPLAYLISTTYPEInvalidEnumValueError extends ExtXPlaylistTypeValidationError {
  readonly type: ValidationErrorType = 'invalid-enum-value';
  readonly tagName = '#EXT-X-PLAYLIST-TYPE';
  readonly description = 'EXT-X-PLAYLIST-TYPE value must be one of: EVENT, VOD (RFC 8216 Section 4.3.3.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXPlaylistTypeValidationErrorUnion =
  | EXTXPLAYLISTTYPENotStringOrNullError
  | EXTXPLAYLISTTYPEInvalidEnumValueError;