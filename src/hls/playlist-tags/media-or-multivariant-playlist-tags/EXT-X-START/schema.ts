import * as z from 'zod';

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

export const TAG = '#EXT-X-START' as const;

export const EXT_X_START_STRING = z.union([
    z.templateLiteral([TAG, ':', 'TIME-OFFSET', '=', z.number()]),
    z.templateLiteral([
        TAG,
        ':',
        'TIME-OFFSET',
        '=',
        z.number(),
        ',',
        'PRECISE',
        '=',
        z.enum(['YES', 'NO']),
    ]),
    z.templateLiteral([
        TAG,
        ':',
        'PRECISE',
        '=',
        z.enum(['YES', 'NO']),
        ',',
        'TIME-OFFSET',
        '=',
        z.number(),
    ]),
]);

export const EXT_X_START_OBJECT = z
    .object({
        /**
         * The value of TIME-OFFSET is a signed-decimal-floating-point number
         * of seconds.  A positive number indicates a time offset from the
         * beginning of the Playlist.  A negative number indicates a negative
         * time offset from the end of the last Media Segment in the
         * Playlist.  This attribute is REQUIRED.
         *
         * The absolute value of TIME-OFFSET SHOULD NOT be larger than the
         * Playlist duration.  If the absolute value of TIME-OFFSET exceeds
         * the duration of the Playlist, it indicates either the end of the
         * Playlist (if positive) or the beginning of the Playlist (if
         * negative).
         *
         * If the Playlist does not contain the EXT-X-ENDLIST tag, the TIME-
         * OFFSET SHOULD NOT be within three target durations of the end of
         * the Playlist file.
         */
        'TIME-OFFSET': z.string(),

        /**
         * The value is an enumerated-string; valid strings are YES and NO.
         * If the value is YES, clients SHOULD start playback at the Media
         * Segment containing the TIME-OFFSET, but SHOULD NOT render media
         * samples in that segment whose presentation times are prior to the
         * TIME-OFFSET.  If the value is NO, clients SHOULD attempt to render
         * every media sample in that segment.  This attribute is OPTIONAL.
         * If it is missing, its value should be treated as NO.
         */
        PRECISE: z.enum(['YES', 'NO']).optional(),
    })
    .readonly();

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

export const EXT_X_START_CODEC = z.codec(EXT_X_START_STRING, EXT_X_START_OBJECT, {
    decode: (str) => {
        // Parse attribute list from the tag
        const attributeListString = str.slice(TAG.length + 1);
        const result: Record<string, string> = {};
        let currentKey = '';
        let currentValue = '';
        let inQuotes = false;
        let i = 0;
        let parsingValue = false;

        while (i < attributeListString.length) {
            const char = attributeListString[i];

            if (char === '"' && (i === 0 || attributeListString[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
                if (parsingValue) {
                    currentValue += char;
                }
            } else if (char === '=' && !inQuotes && !parsingValue) {
                parsingValue = true;
            } else if (char === ',' && !inQuotes) {
                if (currentKey && currentValue !== undefined) {
                    const cleanValue =
                        currentValue.startsWith('"') && currentValue.endsWith('"')
                            ? currentValue.slice(1, -1)
                            : currentValue;
                    result[currentKey] = cleanValue;
                }
                currentKey = '';
                currentValue = '';
                parsingValue = false;
            } else if (parsingValue) {
                currentValue += char;
            } else {
                currentKey += char;
            }
            i++;
        }

        if (currentKey && currentValue !== undefined) {
            const cleanValue =
                currentValue.startsWith('"') && currentValue.endsWith('"')
                    ? currentValue.slice(1, -1)
                    : currentValue;
            result[currentKey] = cleanValue;
        }

        return result as any;
    },
    encode: (obj) => {
        const parts: string[] = [];

        // TIME-OFFSET: signed-decimal-floating-point (not quoted)
        if (obj['TIME-OFFSET'] !== undefined) {
            parts.push(`TIME-OFFSET=${obj['TIME-OFFSET']}`);
        }

        // PRECISE: enumerated-string - YES or NO (not quoted)
        if (obj.PRECISE !== undefined) {
            parts.push(`PRECISE=${obj.PRECISE}`);
        }

        return `${TAG}:${parts.join(',')}` as any;
    },
});

export type EXT_X_START_STRING_TYPE =
    | `#EXT-X-START:TIME-OFFSET=${number}`
    | `#EXT-X-START:TIME-OFFSET=${number},PRECISE=${'YES' | 'NO'}`
    | `#EXT-X-START:PRECISE=${'YES' | 'NO'},TIME-OFFSET=${number}`;
