import { describe, it, expect } from 'vitest';
import { EXT_X_DATERANGE_CODEC } from './schema';

describe('EXT_X_DATERANGE_CODEC', () => {
    describe('EXT_X_DATERANGE_CODEC decoding', () => {
        it('should decode a valid EXT_X_DATERANGE tag', () => {
            const tag =
                '#EXT-X-DATERANGE:ID="1",CLASS="test",START-DATE="2025-09-19T04:07:10.592Z",END-DATE="2025-09-19T04:07:10.592Z",DURATION=10,PLANNED-DURATION=10,END-ON-NEXT="YES"';
            const result = EXT_X_DATERANGE_CODEC.safeDecode(tag);
            expect(result.success).toBe(true);
        });
    });

    describe('EXT_X_DATERANGE_CODEC encoding', () => {
        it('should encode a valid EXT_X_DATERANGE tag', () => {
            const input = {
                ID: '1',
                CLASS: 'test',
                'START-DATE': '2025-09-19T04:07:10.592Z',
                'END-DATE': '2025-09-19T04:07:10.592Z',
                DURATION: 10,
                'PLANNED-DURATION': 10,
                'END-ON-NEXT': 'YES',
            } as const;
            const result = EXT_X_DATERANGE_CODEC.encode(input);
            expect(result).toBe(
                '#EXT-X-DATERANGE:ID="1",CLASS="test",START-DATE="2025-09-19T04:07:10.592Z",END-DATE="2025-09-19T04:07:10.592Z",DURATION=10,PLANNED-DURATION=10,END-ON-NEXT="YES"',
            );
        });
    });
});
