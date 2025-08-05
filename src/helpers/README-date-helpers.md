# Date Helper Functions

This directory contains helper functions for parsing and stringifying ISO 8601 dates as used in HLS playlists according to RFC 8216.

## Overview

The date helpers provide consistent, RFC 8216 compliant date handling for HLS tags that contain date values, such as:
- `#EXT-X-PROGRAM-DATE-TIME` tags
- `#EXT-X-DATERANGE` attributes (`START-DATE`, `END-DATE`)

## Files

### `date-parse.ts`
- **Function**: `dateParse(dateString: string | undefined): Date | undefined`
- **Purpose**: Parses ISO 8601 date strings to Date objects
- **Returns**: Date object if valid, undefined if invalid
- **Supports**: All ISO 8601 formats specified in RFC 8216

### `date-stringify.ts`
- **Function**: `dateStringify(date: Date | undefined): string | undefined`
- **Purpose**: Converts Date objects to ISO 8601 format
- **Returns**: ISO 8601 formatted string, undefined if invalid
- **Format**: `YYYY-MM-DDTHH:mm:ss.sssZ` (UTC with milliseconds)

- **Function**: `dateStringifyWithPrecision(date: Date | undefined, includeMilliseconds: boolean = true): string | undefined`
- **Purpose**: Converts Date objects to ISO 8601 format with optional millisecond precision
- **Returns**: ISO 8601 formatted string, undefined if invalid
- **Format**: With milliseconds: `YYYY-MM-DDTHH:mm:ss.sssZ`, Without: `YYYY-MM-DDTHH:mm:ssZ`

## Supported Date Formats

The helpers support all ISO 8601 formats mentioned in RFC 8216:

- `YYYY-MM-DDThh:mm:ss.SSSZ` (with timezone)
- `YYYY-MM-DDThh:mm:ss.SSS+/-hh:mm` (with timezone offset)
- `YYYY-MM-DDThh:mm:ssZ` (UTC)
- `YYYY-MM-DDThh:mm:ss+/-hh:mm` (with timezone offset)
- `YYYY-MM-DDThh:mm:ss` (local time)

## Usage Examples

### Basic Parsing
```typescript
import { dateParse } from './date-parse';

// Parse RFC 8216 example
const date = dateParse('2010-02-19T14:54:23.031+08:00');
// Returns: Date object representing 2010-02-19T06:54:23.031Z (UTC)
```

### Basic Stringifying
```typescript
import { dateStringify } from './date-stringify';

const date = new Date('2023-01-01T12:00:00.123Z');
const isoString = dateStringify(date);
// Returns: "2023-01-01T12:00:00.123Z"
```

### Precision Control
```typescript
import { dateStringifyWithPrecision } from './date-stringify';

const date = new Date('2023-01-01T12:00:00.123Z');

// With milliseconds (default)
const withMs = dateStringifyWithPrecision(date, true);
// Returns: "2023-01-01T12:00:00.123Z"

// Without milliseconds
const withoutMs = dateStringifyWithPrecision(date, false);
// Returns: "2023-01-01T12:00:00Z"
```

### HLS Tag Integration
```typescript
import { dateParse, dateStringify } from './date-parse';
import { dateStringify } from './date-stringify';

// Parse EXT-X-PROGRAM-DATE-TIME tag
function parseExtXProgramDateTime(tagValue: string): Date | undefined {
    const dateString = tagValue.replace('#EXT-X-PROGRAM-DATE-TIME:', '');
    return dateParse(dateString);
}

// Stringify EXT-X-PROGRAM-DATE-TIME tag
function stringifyExtXProgramDateTime(date: Date): string {
    const dateString = dateStringify(date);
    return `#EXT-X-PROGRAM-DATE-TIME:${dateString}`;
}
```

## Error Handling

All functions handle invalid inputs gracefully:

- **Invalid date strings**: Return `undefined`
- **Invalid Date objects**: Return `undefined`
- **Null/undefined inputs**: Return `undefined`
- **Non-string/non-Date inputs**: Return `undefined`

## RFC 8216 Compliance

The helpers are designed to be fully compliant with RFC 8216 date requirements:

- **Section 4.3.2.3**: EXT-X-PROGRAM-DATE-TIME format
- **Section 4.3.2.7**: EXT-X-DATERANGE date attributes
- **ISO/IEC 8601:2004**: Date/time representation standards

## Testing

Comprehensive test coverage is provided:

- **Unit tests**: `date-parse.spec.ts`, `date-stringify.spec.ts`
- **Integration tests**: `date-integration.spec.ts`
- **Coverage**: Valid formats, invalid inputs, edge cases, RFC examples

## Integration with HLS Parser

These helpers are designed to be used within the HLS parser's tag processing pipeline:

1. **Parsing**: Extract date strings from HLS tags and convert to Date objects
2. **Validation**: Validate date values against RFC 8216 requirements
3. **Stringifying**: Convert Date objects back to RFC 8216 compliant strings
4. **Error Handling**: Provide consistent error handling for invalid dates

## Performance Considerations

- **Efficient**: Uses native JavaScript Date parsing
- **Safe**: Comprehensive input validation
- **Consistent**: Always returns UTC format for stringification
- **Flexible**: Supports both millisecond and non-millisecond precision 