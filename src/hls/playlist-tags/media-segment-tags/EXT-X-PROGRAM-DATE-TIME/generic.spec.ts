import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXProgramDateTimeStringifier } from './stringifier';

describe('EXT-X-PROGRAM-DATE-TIME generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const value = new Date('2010-02-19T14:54:23.031+08:00');
        const stringified = extXProgramDateTimeStringifier(value);

        // TypeScript should infer the exact type
        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T06:54:23.031Z');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with different date formats', () => {
        const value1 = new Date('2010-02-19T14:54:23.031Z');
        const stringified1 = extXProgramDateTimeStringifier(value1);
        expect(stringified1).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031Z');
        expectTypeOf(stringified1).toBeString();

        const value2 = new Date('2023-12-25T10:30:45.123+00:00');
        const stringified2 = extXProgramDateTimeStringifier(value2);
        expect(stringified2).toBe('#EXT-X-PROGRAM-DATE-TIME:2023-12-25T10:30:45.123Z');
        expectTypeOf(stringified2).toBeString();
    });

    it('should work with different timezone offsets', () => {
        const value = new Date('2010-02-19T14:54:23.031-05:00');
        const stringified = extXProgramDateTimeStringifier(value);
        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T19:54:23.031Z');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with dates without timezone', () => {
        const value = new Date('2010-02-19T14:54:23.031');
        const stringified = extXProgramDateTimeStringifier(value);
        expect(stringified).toBe('#EXT-X-PROGRAM-DATE-TIME:2010-02-19T22:54:23.031Z');
        expectTypeOf(stringified).toBeString();
    });

    it('should preserve literal types', () => {
        const value = new Date('2010-02-19T14:54:23.031+08:00');
        const stringified = extXProgramDateTimeStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 