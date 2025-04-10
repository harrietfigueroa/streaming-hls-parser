import { attributeList } from './attribute-list';

describe('Attribute List', () => {
    const withoutLineBreaks = `
 #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="main/english-audio.m3u8"`;
    const withLineBreaks = `
 #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English", \
   DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en", \
   URI="main/english-audio.m3u8"
`;
    it.each([withLineBreaks, withoutLineBreaks])(
        'should parse out the keys and values from an attribute list',
        (testStr) => {
            const parsed = attributeList<Record<string, string>>(testStr);

            for (const [key, value] of Object.entries(parsed)) {
                expect(typeof key).toBe('string');
                expect(typeof value).toBe('string');
            }
        },
    );
});
