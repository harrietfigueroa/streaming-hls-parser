import { describe, expect, it, expectTypeOf } from 'vitest';
import { extinfStringifier } from './stringifier';

describe('EXTINF stringifier', () => {
    it('should stringify with duration only', () => {
        const value = { DURATION: 8.5 };
        const stringified = extinfStringifier(value);

        expect(stringified).toBe('#EXTINF:8.5,');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify with duration and title', () => {
        const value = { DURATION: 10.5, TITLE: 'Segment Title' };
        const stringified = extinfStringifier(value);

        expect(stringified).toBe('#EXTINF:10.5,Segment Title');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify integer duration', () => {
        const value = { DURATION: 15 };
        const stringified = extinfStringifier(value);

        expect(stringified).toBe('#EXTINF:15,');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify zero duration', () => {
        const value = { DURATION: 0 };
        const stringified = extinfStringifier(value);

        expect(stringified).toBe('#EXTINF:0,');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify with empty title', () => {
        const value = { DURATION: 5.2, TITLE: '' };
        const stringified = extinfStringifier(value);

        expect(stringified).toBe('#EXTINF:5.2,');
        expectTypeOf(stringified).toBeString();
    });

    it('should use the actual passed values', () => {
        const value = { DURATION: 42.7, TITLE: 'Custom Title' };
        const stringified = extinfStringifier(value);

        expect(stringified).toBe('#EXTINF:42.7,Custom Title');
        expectTypeOf(stringified).toBeString();
    });

    it('should have correct generic type inference', () => {
        const value = { DURATION: 25.3, TITLE: 'Test Segment' } as const;
        const stringified = extinfStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 