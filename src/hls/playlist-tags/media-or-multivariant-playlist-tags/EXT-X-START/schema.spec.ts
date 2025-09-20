import { describe, expect, it, expectTypeOf } from 'vitest';
import { EXT_X_START_CODEC } from './schema';

describe('EXT-X-START schema', () => {
    describe('EXT_X_START_SCHEMA parsing', () => {
        it('should parse valid attribute list with TIME-OFFSET only', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '10.5',
            });
            expectTypeOf(result).toHaveProperty('TIME-OFFSET').toBeString();
        });

        it('should parse valid attribute list with TIME-OFFSET and PRECISE=YES', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '10.5',
                PRECISE: 'YES',
            });
            expectTypeOf(result).toHaveProperty('TIME-OFFSET').toBeString();
        });

        it('should parse valid attribute list with TIME-OFFSET and PRECISE=NO', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '10.5',
                PRECISE: 'NO',
            });
        });

        it('should parse negative TIME-OFFSET values', () => {
            const input = '#EXT-X-START:TIME-OFFSET=-5.25';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '-5.25',
            });
        });

        it('should parse zero TIME-OFFSET values', () => {
            const input = '#EXT-X-START:TIME-OFFSET=0.0';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '0.0',
            });
        });

        it('should parse large TIME-OFFSET values', () => {
            const input = '#EXT-X-START:TIME-OFFSET=999999.999';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '999999.999',
            });
        });

        it('should parse with different attribute order', () => {
            const input = '#EXT-X-START:PRECISE=YES,TIME-OFFSET=10.5';
            const result = EXT_X_START_CODEC.decode(input);

            expect(result).toEqual({
                'TIME-OFFSET': '10.5',
                PRECISE: 'YES',
            });
        });
    });

    describe('EXT_X_START_SCHEMA encoding', () => {
        it('should encode object with TIME-OFFSET only', () => {
            const input = {
                'TIME-OFFSET': '10.5',
            };
            const result = EXT_X_START_CODEC.encode(input);

            expect(result).toBe('#EXT-X-START:TIME-OFFSET=10.5');
        });

        it('should encode object with TIME-OFFSET and PRECISE=YES', () => {
            const input = {
                'TIME-OFFSET': '10.5',
                PRECISE: 'YES' as const,
            };
            const result = EXT_X_START_CODEC.encode(input);

            expect(result).toBe('#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES');
        });

        it('should encode object with TIME-OFFSET and PRECISE=NO', () => {
            const input = {
                'TIME-OFFSET': '10.5',
                PRECISE: 'NO' as const,
            };
            const result = EXT_X_START_CODEC.encode(input);

            expect(result).toBe('#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO');
        });

        it('should encode negative TIME-OFFSET values', () => {
            const input = {
                'TIME-OFFSET': '-5.25',
            };
            const result = EXT_X_START_CODEC.encode(input);

            expect(result).toBe('#EXT-X-START:TIME-OFFSET=-5.25');
        });

        it('should encode zero TIME-OFFSET values', () => {
            const input = {
                'TIME-OFFSET': '0.0',
            };
            const result = EXT_X_START_CODEC.encode(input);

            expect(result).toBe('#EXT-X-START:TIME-OFFSET=0.0');
        });
    });

    describe('EXT_X_START_SCHEMA validation errors', () => {
        it('should reject missing TIME-OFFSET attribute', () => {
            const input = '#EXT-X-START:PRECISE=YES';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject invalid TIME-OFFSET format (integer)', () => {
            const input = 'EXT-X-START:TIME-OFFSET=10';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject invalid TIME-OFFSET format (no decimal)', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.';

            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject invalid TIME-OFFSET format (no integer part)', () => {
            const input = '#EXT-X-START:TIME-OFFSET=.5';

            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject invalid PRECISE value', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=MAYBE';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject invalid PRECISE value (lowercase)', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=yes';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject invalid PRECISE value (mixed case)', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=Yes';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject empty attribute list', () => {
            const input = '#EXT-X-START:';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject malformed attribute list (missing equals)', () => {
            const input = '#EXT-X-START:TIME-OFFSET10.5';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject malformed attribute list (extra equals)', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5=extra';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });

        it('should reject duplicate attributes', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,TIME-OFFSET=20.0';

            // @ts-expect-error
            expect(() => EXT_X_START_CODEC.decode(input)).toThrow();
        });
    });

    describe('EXT_X_START_SCHEMA roundtrip', () => {
        it('should roundtrip TIME-OFFSET only', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5';
            const parsed = EXT_X_START_CODEC.decode(input);
            const encoded = EXT_X_START_CODEC.encode(parsed);

            expect(encoded).toBe(input);
        });

        it('should roundtrip TIME-OFFSET and PRECISE=YES', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES';
            const parsed = EXT_X_START_CODEC.decode(input);
            const encoded = EXT_X_START_CODEC.encode(parsed);

            expect(encoded).toBe(input);
        });

        it('should roundtrip TIME-OFFSET and PRECISE=NO', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO';
            const parsed = EXT_X_START_CODEC.decode(input);
            const encoded = EXT_X_START_CODEC.encode(parsed);

            expect(encoded).toBe(input);
        });

        it('should roundtrip negative TIME-OFFSET', () => {
            const input = '#EXT-X-START:TIME-OFFSET=-5.25';
            const parsed = EXT_X_START_CODEC.decode(input);
            const encoded = EXT_X_START_CODEC.encode(parsed);

            expect(encoded).toBe(input);
        });

        it('should roundtrip zero TIME-OFFSET', () => {
            const input = '#EXT-X-START:TIME-OFFSET=0.0';
            const parsed = EXT_X_START_CODEC.decode(input);
            const encoded = EXT_X_START_CODEC.encode(parsed);

            expect(encoded).toBe(input);
        });
    });

    describe('Type safety', () => {
        it('should have correct type inference for parsed result', () => {
            const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES';
            const result = EXT_X_START_CODEC.decode(input);

            expectTypeOf(result).toHaveProperty('TIME-OFFSET').toBeString();
            expectTypeOf(result)
                .toHaveProperty('PRECISE')
                .toEqualTypeOf<'YES' | 'NO' | undefined>();
            expectTypeOf(result.PRECISE).toEqualTypeOf<'YES' | 'NO' | undefined>();
        });

        it('should have correct type inference for encoded result', () => {
            const input = {
                'TIME-OFFSET': '10.5',
                PRECISE: 'YES' as const,
            };
            const result = EXT_X_START_CODEC.encode(input);

            expectTypeOf(result).toBeString();
        });
    });
});
