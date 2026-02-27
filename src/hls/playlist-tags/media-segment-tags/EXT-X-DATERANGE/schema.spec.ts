import { describe, it, expect } from 'vitest';
import { EXT_X_DATERANGE_CODEC } from './schema';

describe('EXT_X_DATERANGE_CODEC', () => {
    describe('EXT_X_DATERANGE_CODEC decoding', () => {
        it('should decode a valid EXT_X_DATERANGE tag with END-DATE and DURATION', () => {
            const tag =
                '#EXT-X-DATERANGE:ID="1",CLASS="test",START-DATE="2025-09-19T04:07:10.592Z",END-DATE="2025-09-19T04:07:20.592Z",DURATION=10,PLANNED-DURATION=10';
            const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
            expect(result.success).toBe(true);
        });

        it('should decode a valid EXT_X_DATERANGE tag with END-ON-NEXT', () => {
            const tag = '#EXT-X-DATERANGE:ID="2",CLASS="ad",START-DATE="2025-09-19T04:07:10.592Z",END-ON-NEXT="YES"';
            const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
            expect(result.success).toBe(true);
        });

        it('should decode a valid EXT_X_DATERANGE tag without optional fields', () => {
            const tag = '#EXT-X-DATERANGE:ID="simple",START-DATE="2025-09-19T04:07:10.592Z"';
            const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
            expect(result.success).toBe(true);
        });
    });

    describe('EXT_X_DATERANGE_CODEC encoding', () => {
        it('should encode a valid EXT_X_DATERANGE tag with END-DATE and DURATION', () => {
            const input = {
                ID: '1',
                CLASS: 'test',
                'START-DATE': '2025-09-19T04:07:10.592Z',
                'END-DATE': '2025-09-19T04:07:20.592Z',
                DURATION: 10,
                'PLANNED-DURATION': 10,
            } as const;
            const result = EXT_X_DATERANGE_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-DATERANGE:ID="1",CLASS="test",START-DATE="2025-09-19T04:07:10.592Z",END-DATE="2025-09-19T04:07:20.592Z",DURATION=10,PLANNED-DURATION=10',
            );
        });

        it('should encode a valid EXT_X_DATERANGE tag with END-ON-NEXT', () => {
            const input = {
                ID: '2',
                CLASS: 'ad',
                'START-DATE': '2025-09-19T04:07:10.592Z',
                'END-ON-NEXT': 'YES',
            } as const;
            const result = EXT_X_DATERANGE_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-DATERANGE:ID="2",CLASS="ad",START-DATE="2025-09-19T04:07:10.592Z",END-ON-NEXT="YES"',
            );
        });
    });

    describe('RFC 8216 Validation Rules', () => {
        describe('Rule 1: END-DATE must be >= START-DATE', () => {
            it('should fail when END-DATE is before START-DATE', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T09:00:00.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('END-DATE must be equal to or later than START-DATE');
                    expect(result.error.issues[0].path).toContain('END-DATE');
                }
            });

            it('should pass when END-DATE equals START-DATE', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T10:00:00.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });

            it('should pass when END-DATE is after START-DATE', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T11:00:00.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });
        });

        describe('Rule 2: END-DATE must equal START-DATE + DURATION', () => {
            it('should fail when END-DATE does not match START-DATE + DURATION', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T10:05:00.000Z",DURATION=10';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('END-DATE must equal START-DATE plus DURATION');
                }
            });

            it('should pass when END-DATE matches START-DATE + DURATION', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T10:00:10.000Z",DURATION=10';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });

            it('should pass when DURATION is not present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-DATE="2025-09-19T11:00:00.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });
        });

        describe('Rule 3: CLASS is required when END-ON-NEXT=YES', () => {
            it('should fail when END-ON-NEXT=YES but CLASS is missing', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('CLASS attribute is REQUIRED when END-ON-NEXT=YES');
                    expect(result.error.issues[0].path).toContain('CLASS');
                }
            });

            it('should pass when END-ON-NEXT=YES and CLASS is present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",CLASS="ad",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });

            it('should pass when END-ON-NEXT is not present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });
        });

        describe('Rule 4: DURATION and END-DATE must not be present when END-ON-NEXT=YES', () => {
            it('should fail when END-ON-NEXT=YES and DURATION is present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",CLASS="ad",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES",DURATION=10';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('DURATION and END-DATE attributes MUST NOT be present when END-ON-NEXT=YES');
                }
            });

            it('should fail when END-ON-NEXT=YES and END-DATE is present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",CLASS="ad",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES",END-DATE="2025-09-19T10:00:10.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('DURATION and END-DATE attributes MUST NOT be present when END-ON-NEXT=YES');
                }
            });

            it('should fail when END-ON-NEXT=YES and both DURATION and END-DATE are present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",CLASS="ad",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES",DURATION=10,END-DATE="2025-09-19T10:00:10.000Z"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('DURATION and END-DATE attributes MUST NOT be present when END-ON-NEXT=YES');
                }
            });

            it('should pass when END-ON-NEXT=YES and neither DURATION nor END-DATE are present', () => {
                const tag = '#EXT-X-DATERANGE:ID="1",CLASS="ad",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES"';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(true);
            });
        });

        describe('Multiple validation errors', () => {
            it('should report multiple validation errors when multiple rules are violated', () => {
                // This violates both Rule 3 (CLASS required) and Rule 4 (DURATION not allowed)
                const tag = '#EXT-X-DATERANGE:ID="1",START-DATE="2025-09-19T10:00:00.000Z",END-ON-NEXT="YES",DURATION=10';
                const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
                }
            });
        });
    });
});
