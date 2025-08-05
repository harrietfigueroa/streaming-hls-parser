/**
 * The EXT-X-I-FRAMES-ONLY tag indicates that each Media Segment in the
   Playlist describes a single I-frame.  I-frames are encoded video
   frames whose encoding does not depend on any other frame.  I-frame
   Playlists can be used for trick play, such as fast forward, rapid
   reverse, and scrubbing.

   The EXT-X-I-FRAMES-ONLY tag applies to the entire Playlist.  Its
   format is:

   #EXT-X-I-FRAMES-ONLY

   In a Playlist with the EXT-X-I-FRAMES-ONLY tag, the Media Segment
   duration (EXTINF tag value) is the time between the presentation time
   of the I-frame in the Media Segment and the presentation time of the
   next I-frame in the Playlist, or the end of the presentation if it is
   the last I-frame in the Playlist.

   Media resources containing I-frame segments MUST begin with either a
   Media Initialization Section (Section 3) or be accompanied by an EXT-
   X-MAP tag indicating the Media Initialization Section so that clients
   can load and decode I-frame segments in any order.  The byte range of
   an I-frame segment with an EXT-X-BYTERANGE tag applied to it
   (Section 4.3.2.2) MUST NOT include its Media Initialization Section;
 */
export type EXT_X_I_FRAMES_ONLY_PARSED = boolean;
export type EXT_X_I_FRAMES_ONLY_STRING = '#EXT-X-I-FRAMES-ONLY';

import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';



// Abstract validation error class for this tag
export abstract class ExtXIFramesOnlyValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-I-FRAMES-ONLY';
}

// Concrete validation error classes
export class EXTXIFRAMESONLYNotABooleanError extends ExtXIFramesOnlyValidationError {
    readonly type: ValidationErrorType = 'not-a-boolean';
    readonly tagName = '#EXT-X-I-FRAMES-ONLY';
    readonly description = 'EXT-X-I-FRAMES-ONLY value must be a boolean indicating presence of the tag (RFC 8216 Section 4.3.3.6: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.6)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtXIFramesOnlyValidationErrorUnion =
    | EXTXIFRAMESONLYNotABooleanError;