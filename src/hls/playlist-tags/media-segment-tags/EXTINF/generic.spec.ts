import { describe, expect, it, expectTypeOf } from 'vitest';
import { extinfStringifier } from './stringifier';

describe('EXTINF generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const value = { DURATION: 8.5 } as const;
        const stringified = extinfStringifier(value);

        // TypeScript should infer the exact type
        expect(stringified).toBe('#EXTINF:8.5,');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with different duration types', () => {
        const value1 = { DURATION: 10.2 };
        const stringified1 = extinfStringifier(value1);
        expect(stringified1).toBe('#EXTINF:10.2,');
        expectTypeOf(stringified1).toBeString();

        const value2 = { DURATION: 30 };
        const stringified2 = extinfStringifier(value2);
        expect(stringified2).toBe('#EXTINF:30,');
        expectTypeOf(stringified2).toBeString();
    });

    it('should work with duration and title', () => {
        const value = { DURATION: 15.7, TITLE: 'Segment Title' };
        const stringified = extinfStringifier(value);
        expect(stringified).toBe('#EXTINF:15.7,Segment Title');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with zero duration', () => {
        const value = { DURATION: 0 };
        const stringified = extinfStringifier(value);
        expect(stringified).toBe('#EXTINF:0,');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with large numbers', () => {
        const value = { DURATION: 999.9 };
        const stringified = extinfStringifier(value);
        expect(stringified).toBe('#EXTINF:999.9,');
        expectTypeOf(stringified).toBeString();
    });

    it('should preserve literal types', () => {
        const value = { DURATION: 42.3, TITLE: 'Test Segment' } as const;
        const stringified = extinfStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 