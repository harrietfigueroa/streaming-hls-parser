import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXProgramDateTimeParser } from './parser';

describe('EXT-X-PROGRAM-DATE-TIME parser', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00';
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeInstanceOf(Date);
        expect(parsed?.getTime()).toBe(1266562463031);
    });

    it('should parse date without milliseconds', () => {
        const test = '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23+08:00';
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeInstanceOf(Date);
    });

    it('should parse date with UTC timezone', () => {
        const test = '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z';
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeInstanceOf(Date);
    });

    it('should parse date without timezone', () => {
        const test = '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031';
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeInstanceOf(Date);
    });

    it('should return undefined for invalid input', () => {
        const test = 'invalid';
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeUndefined();
    });

    it('should return undefined for invalid date format', () => {
        const test = '#EXT-X-PROGRAM-DATE-TIME:invalid-date';
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeUndefined();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00' as const;
        const parsed = extXProgramDateTimeParser(test);

        expect(parsed).toBeInstanceOf(Date);
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(parsed).not.toBeBoolean();
        expectTypeOf(parsed).not.toBeNumber();
    });
}); 