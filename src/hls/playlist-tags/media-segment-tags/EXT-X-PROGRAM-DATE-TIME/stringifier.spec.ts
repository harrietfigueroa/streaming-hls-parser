import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXProgramDateTimeStringifier } from './stringifier';

describe('EXT-X-PROGRAM-DATE-TIME stringifier', () => {
    it('should stringify with ISO date format', () => {
        const value = new Date('2010-02-19T14:54:23.031+08:00');
        const stringified = extXProgramDateTimeStringifier(value);

        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T06:54:23.031Z');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify with UTC timezone', () => {
        const value = new Date('2010-02-19T14:54:23.031Z');
        const stringified = extXProgramDateTimeStringifier(value);

        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify without milliseconds', () => {
        const value = new Date('2010-02-19T14:54:23+08:00');
        const stringified = extXProgramDateTimeStringifier(value);

        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T06:54:23.000Z');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify with negative timezone offset', () => {
        const value = new Date('2010-02-19T14:54:23.031-05:00');
        const stringified = extXProgramDateTimeStringifier(value);

        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T19:54:23.031Z');
        expectTypeOf(stringified).toBeString();
    });

    it('should use the actual passed value', () => {
        const value = new Date('2023-12-25T10:30:45.123+00:00');
        const stringified = extXProgramDateTimeStringifier(value);

        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2023-12-25T10:30:45.123Z');
        expectTypeOf(stringified).toBeString();
    });

    it('should have correct generic type inference', () => {
        const value = new Date('2010-02-19T14:54:23.031+08:00');
        const stringified = extXProgramDateTimeStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 