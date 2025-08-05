import { describe, expect, it, expectTypeOf } from 'vitest';
import { extinfParser } from './parser';

describe('EXTINF parser', () => {
    it('should parse the tag with duration only', () => {
        const test = '#EXTINF:8.5,';
        const parsed = extinfParser(test);

        expect(parsed).toEqual({
            DURATION: 8.5,
            TITLE: undefined,
            _originalDuration: '8.5',
        });
        expect(parsed).toBeDefined();
    });

    it('should parse the tag with duration and title', () => {
        const test = '#EXTINF:10.5,Segment Title';
        const parsed = extinfParser(test);

        expect(parsed).toEqual({
            DURATION: 10.5,
            TITLE: 'Segment Title',
            _originalDuration: '10.5',
        });
        expect(parsed).toBeDefined();
    });

    it('should parse integer duration', () => {
        const test = '#EXTINF:15,';
        const parsed = extinfParser(test);

        expect(parsed).toEqual({
            DURATION: 15,
            TITLE: undefined,
            _originalDuration: '15',
        });
        expect(parsed).toBeDefined();
    });

    it('should parse zero duration', () => {
        const test = '#EXTINF:0,';
        const parsed = extinfParser(test);

        expect(parsed).toEqual({
            DURATION: 0,
            TITLE: undefined,
            _originalDuration: '0',
        });
        expect(parsed).toBeDefined();
    });

    it('should parse with empty title', () => {
        const test = '#EXTINF:5.2,';
        const parsed = extinfParser(test);

        expect(parsed).toEqual({
            DURATION: 5.2,
            TITLE: undefined,
            _originalDuration: '5.2',
        });
        expect(parsed).toBeDefined();
    });

    it('should return undefined for invalid input', () => {
        const test = 'invalid';
        const parsed = extinfParser(test);

        expect(parsed).toBeUndefined();
    });

    it('should have correct generic type inference', () => {
        const test = '#EXTINF:10.5,Segment Title' as const;
        const parsed = extinfParser(test);

        expect(parsed).toBeDefined();
        expectTypeOf(parsed).not.toBeString();
        expectTypeOf(parsed).not.toBeBoolean();
        expectTypeOf(parsed).not.toBeNumber();
    });
}); 