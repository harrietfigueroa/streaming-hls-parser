/**
 * The EXT-X-START tag indicates a preferred point at which to start
   playing a Playlist.  By default, clients SHOULD start playback at
   this point when beginning a playback session.  This tag is OPTIONAL.

   Its format is:

   #EXT-X-START:<attribute-list>

   The following attributes are defined:

      TIME-OFFSET

      The value of TIME-OFFSET is a signed-decimal-floating-point number
      of seconds.  A positive number indicates a time offset from the
      beginning of the Playlist.  A negative number indicates a negative
      time offset from the end of the last Media Segment in the
      Playlist.  This attribute is REQUIRED.

      The absolute value of TIME-OFFSET SHOULD NOT be larger than the
      Playlist duration.  If the absolute value of TIME-OFFSET exceeds
      the duration of the Playlist, it indicates either the end of the
      Playlist (if positive) or the beginning of the Playlist (if
      negative).

      If the Playlist does not contain the EXT-X-ENDLIST tag, the TIME-
      OFFSET SHOULD NOT be within three target durations of the end of
      the Playlist file.

      PRECISE

      The value is an enumerated-string; valid strings are YES and NO.
      If the value is YES, clients SHOULD start playback at the Media
      Segment containing the TIME-OFFSET, but SHOULD NOT render media
      samples in that segment whose presentation times are prior to the
      TIME-OFFSET.  If the value is NO, clients SHOULD attempt to render
      every media sample in that segment.  This attribute is OPTIONAL.
      If it is missing, its value should be treated as NO.
 */
export const PreciseValues = {
  /**
   * If the value is YES, clients SHOULD start playback at the Media
   * Segment containing the TIME-OFFSET, but SHOULD NOT render media
   * samples in that segment whose presentation times are prior to the
   * TIME-OFFSET.
   */
  YES: 'YES',
  /**
   * If the value is NO, clients SHOULD attempt to render
   * every media sample in that segment.
   */
  NO: 'NO',
} as const;

export type PreciseValue = (typeof PreciseValues)[keyof typeof PreciseValues];

export interface EXT_X_START_PARSED<timeOffset extends number = number, precise extends PreciseValue | undefined = PreciseValue | undefined> {
  /**
   * The value of TIME-OFFSET is a signed-decimal-floating-point number
    of seconds.  A positive number indicates a time offset from the
    beginning of the Playlist.  A negative number indicates a negative
    time offset from the end of the last Media Segment in the
    Playlist.  This attribute is REQUIRED.

    The absolute value of TIME-OFFSET SHOULD NOT be larger than the
    Playlist duration.  If the absolute value of TIME-OFFSET exceeds
    the duration of the Playlist, it indicates either the end of the
    Playlist (if positive) or the beginning of the Playlist (if
    negative).

    If the Playlist does not contain the EXT-X-ENDLIST tag, the TIME-
    OFFSET SHOULD NOT be within three target durations of the end of
    the Playlist file.
 */
  'TIME-OFFSET': timeOffset;

  /**
   * The value is an enumerated-string; valid strings are YES and NO.
    If the value is YES, clients SHOULD start playback at the Media
    Segment containing the TIME-OFFSET, but SHOULD NOT render media
    samples in that segment whose presentation times are prior to the
    TIME-OFFSET.  If the value is NO, clients SHOULD attempt to render
    every media sample in that segment.  This attribute is OPTIONAL.
    If it is missing, its value should be treated as NO.
   */
  PRECISE?: precise;
}

export type EXT_X_START_STRING<timeOffset extends number = number, precise extends PreciseValue | undefined = PreciseValue | undefined> =
  precise extends undefined
  ? `#EXT-X-START:TIME-OFFSET=${timeOffset}`
  : `#EXT-X-START:TIME-OFFSET=${timeOffset},PRECISE=${precise}`;

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

// Abstract validation error class for this tag
export abstract class ExtXStartValidationError extends AbstractValidationError {
  abstract readonly tagName: '#EXT-X-START';
}

// Concrete validation error classes
export class EXTXSTARTNotObjectError extends ExtXStartValidationError {
  readonly type: ValidationErrorType = 'not-string-or-null';
  readonly tagName = '#EXT-X-START';
  readonly description = 'EXT-X-START value must be an object (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXSTARTMissingTimeOffsetError extends ExtXStartValidationError {
  readonly type: ValidationErrorType = 'not-string-or-null';
  readonly tagName = '#EXT-X-START';
  readonly description = 'EXT-X-START must have TIME-OFFSET attribute (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXSTARTInvalidTimeOffsetError extends ExtXStartValidationError {
  readonly type: ValidationErrorType = 'not-a-number';
  readonly tagName = '#EXT-X-START';
  readonly description = 'EXT-X-START TIME-OFFSET must be a number (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export class EXTXSTARTInvalidPreciseError extends ExtXStartValidationError {
  readonly type: ValidationErrorType = 'invalid-enum-value';
  readonly tagName = '#EXT-X-START';
  readonly description = 'EXT-X-START PRECISE must be YES or NO (RFC 8216 Section 4.3.2.2: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)';

  constructor(public readonly invalidValue: any) {
    super();
  }
}

export type ExtXStartValidationErrorUnion =
  | EXTXSTARTNotObjectError
  | EXTXSTARTMissingTimeOffsetError
  | EXTXSTARTInvalidTimeOffsetError
  | EXTXSTARTInvalidPreciseError;
