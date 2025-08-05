import { describe, it, expect } from 'vitest';
import { extXDateRangeParser } from './parser';
import { EXT_X_DATERANGE_PARSED } from './types';

describe('EXT-X-DATERANGE parser', () => {
    describe('valid inputs', () => {
        it('should parse basic EXT-X-DATERANGE with required attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.ID).toBe('test-id');
            expect(result?.['START-DATE']).toEqual(new Date('2023-01-01T00:00:00.000Z'));
        });

        it('should parse EXT-X-DATERANGE with all optional attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400,SCTE35-CMD="test-cmd",SCTE35-OUT="test-out",SCTE35-IN="test-in",END-ON-NEXT=YES';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.ID).toBe('test-id');
            expect(result?.CLASS).toBe('test-class');
            expect(result?.['START-DATE']).toEqual(new Date('2023-01-01T00:00:00.000Z'));
            expect(result?.['END-DATE']).toEqual(new Date('2023-01-02T00:00:00.000Z'));
            expect(result?.DURATION).toBe(86400);
            expect(result?.['PLANNED-DURATION']).toBe(86400);
            expect(result?.['SCTE35-CMD']).toBe('test-cmd');
            expect(result?.['SCTE35-OUT']).toBe('test-out');
            expect(result?.['SCTE35-IN']).toBe('test-in');
            expect(result?.['END-ON-NEXT']).toBe('YES');
        });

        it('should parse EXT-X-DATERANGE with client-defined X- attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",X-COM-EXAMPLE-AD-ID="XYZ123",X-CUSTOM-ATTR="custom-value"';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.ID).toBe('test-id');
            expect(result?.['X-COM-EXAMPLE-AD-ID']).toBe('XYZ123');
            expect(result?.['X-CUSTOM-ATTR']).toBe('custom-value');
        });

        it('should parse EXT-X-DATERANGE with numeric X- attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",X-NUMERIC-ATTR=123.45';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.ID).toBe('test-id');
            expect(result?.['X-NUMERIC-ATTR']).toBe(123.45);
        });

        it('should parse EXT-X-DATERANGE with hexadecimal X- attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",X-HEX-ATTR=0xABCDEF';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.ID).toBe('test-id');
            expect(result?.['X-HEX-ATTR']).toBe('0xABCDEF');
        });
    });

    describe('invalid inputs', () => {
        it('should return undefined for undefined input', () => {
            const result = extXDateRangeParser(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined for empty string', () => {
            const result = extXDateRangeParser('');
            expect(result).toBeUndefined();
        });

        it('should return undefined for malformed tag', () => {
            const result = extXDateRangeParser('#EXT-X-DATERANGE');
            expect(result).toBeUndefined();
        });

        it('should return undefined for invalid attribute format', () => {
            const result = extXDateRangeParser('#EXT-X-DATERANGE:ID=test-id,START-DATE=2023-01-01T00:00:00.000Z');
            expect(result).toBeUndefined();
        });

        it('should return undefined for missing required attributes', () => {
            const result = extXDateRangeParser('#EXT-X-DATERANGE:CLASS="test-class"');
            expect(result).toBeUndefined();
        });
    });

    describe('generic type inference', () => {
        it('should have correct type inference for basic input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const result = extXDateRangeParser(input);

            // Type should be inferred correctly
            expect(result).toBeDefined();
            if (result) {
                expect(result.ID).toBe('test-id');
                expect(result['START-DATE']).toEqual(new Date('2023-01-01T00:00:00.000Z'));
            }
        });

        it('should handle complex X- attributes with type inference', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",X-ATTR1="value1",X-ATTR2=123.45' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                expect(result['X-ATTR1']).toBe('value1');
                expect(result['X-ATTR2']).toBe(123.45);
            }
        });
    });

    describe('edge cases', () => {
        it('should handle dates with different formats', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T12:30:45.123Z"';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.['START-DATE']).toEqual(new Date('2023-01-01T12:30:45.123Z'));
        });

        it('should handle large duration values', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",DURATION=999999.999';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.DURATION).toBe(999999.999);
        });

        it('should handle zero duration', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",DURATION=0';
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            expect(result?.DURATION).toBe(0);
        });
    });
}); 