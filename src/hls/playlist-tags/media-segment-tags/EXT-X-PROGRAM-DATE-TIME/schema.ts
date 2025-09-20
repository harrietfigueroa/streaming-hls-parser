import { z } from 'zod';
import {
    AbstractValidationError,
    ValidationErrorType,
} from '../../../validation-helpers/validator.types';
import { fromAttributeList } from '../../../parse-helpers/attribute-list';
import { stripTag } from '../../../parse-helpers/strip-tag';

/**
 * The EXT-X-PROGRAM-DATE-TIME tag associates the first sample of a
   Media Segment with an absolute date and/or time.  It applies only to
   the next Media Segment.  Its format is:

   #EXT-X-PROGRAM-DATE-TIME:<date-time-msec>

   where date-time-msec is an ISO/IEC 8601:2004 [ISO_8601] date/time
   representation, such as YYYY-MM-DDThh:mm:ss.SSSZ.  It SHOULD indicate
   a time zone and fractional parts of seconds, to millisecond accuracy.

   For example:

   #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00

   See Sections 6.2.1 and 6.3.3 for more information on the EXT-X-
   PROGRAM-DATE-TIME tag.
 */
export const TAG = '#EXT-X-PROGRAM-DATE-TIME' as const;
export const EXT_X_PROGRAM_DATE_TIME_STRING = z.templateLiteral([TAG, ':', z.iso.datetime()]);

export const EXT_X_PROGRAM_DATE_TIME_OBJECT = z.date();

export const EXT_X_PROGRAM_DATE_TIME_CODEC = z.codec(
    EXT_X_PROGRAM_DATE_TIME_STRING,
    EXT_X_PROGRAM_DATE_TIME_OBJECT,
    {
        decode: (value) => new Date(stripTag(value)),
        encode: (value) => `${TAG}:${value.toISOString()}` as any,
    },
);
