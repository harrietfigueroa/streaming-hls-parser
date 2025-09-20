import { describe, expect, it } from 'vitest';
import { attributeListStringSchema, attributeListObjectSchema } from './attribute-list';

describe('Attribute List', () => {
    const withoutLineBreaks =
        `TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="main/english-audio.m3u8"`.trim();
    const withLineBreaks =
        `TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en,URI="main/english-audio.m3u8"
`.trim();
    it.each([withLineBreaks, withoutLineBreaks])(
        'should parse in both directions',
        (testStr: string) => {
            const parsed = attributeListStringSchema.parse(testStr);

            for (const [key, value] of Object.entries(parsed)) {
                expect(typeof key).toBe('string');
                expect(typeof value).toBe('string');
            }

            const stringified = attributeListObjectSchema.parse(parsed);

            expect(stringified).toBe(testStr);
        },
    );
});
