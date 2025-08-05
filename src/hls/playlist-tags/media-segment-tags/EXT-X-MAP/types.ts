import { AbstractValidationError, ValidationErrorType } from '../../../validation-helpers/validator.types';

/**
 * The EXT-X-MAP tag specifies how to obtain the Media Initialization
 * Section.  It applies to every Media Segment that appears after it in
 * the Playlist until the next EXT-X-MAP tag (if any) with the same
 * URI attribute value.  Its format is:

   #EXT-X-MAP:<attribute-list>

   where attribute-list contains one or more of the following
   attribute/value pairs:

   URI=<uri>
   BYTERANGE=<n>[@<o>]

   where uri is a quoted-string; n and o are decimal-integers.
 */
export interface EXT_X_MAP_PARSED {
    URI: string;
    BYTERANGE?: {
        LENGTH: number;
        OFFSET?: number;
    };
}

export type EXT_X_MAP_STRING = `#EXT-X-MAP:${string}`;

// Abstract validation error class for this tag
export abstract class ExtXMapValidationError extends AbstractValidationError {
    abstract readonly tagName: '#EXT-X-MAP';
}

// Concrete validation error classes
export class ExtXMapNotAnObjectError extends ExtXMapValidationError {
    readonly type: ValidationErrorType = 'not-an-object';
    readonly tagName = '#EXT-X-MAP';
    readonly description = 'EXT-X-MAP value must be an object (RFC 8216 Section 4.3.2.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXMapMissingUriError extends ExtXMapValidationError {
    readonly type: ValidationErrorType = 'missing-uri';
    readonly tagName = '#EXT-X-MAP';
    readonly description = 'EXT-X-MAP object must have a URI property (RFC 8216 Section 4.3.2.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXMapInvalidUriError extends ExtXMapValidationError {
    readonly type: ValidationErrorType = 'not-string-or-null';
    readonly tagName = '#EXT-X-MAP';
    readonly description = 'EXT-X-MAP URI must be a valid quoted string (RFC 8216 Section 4.3.2.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export class ExtXMapInvalidByteRangeError extends ExtXMapValidationError {
    readonly type: ValidationErrorType = 'length-not-a-number';
    readonly tagName = '#EXT-X-MAP';
    readonly description = 'EXT-X-MAP BYTERANGE must have a valid LENGTH value (RFC 8216 Section 4.3.2.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5)';

    constructor(public readonly invalidValue: any) {
        super();
    }
}

export type ExtXMapValidationErrorUnion =
    | ExtXMapNotAnObjectError
    | ExtXMapMissingUriError
    | ExtXMapInvalidUriError
    | ExtXMapInvalidByteRangeError; 