import sessionDataParser from './parser';

describe('EXT-X-SESSION-DATA', () => {
    describe('should parse out the values from an EXT-X-SESSION-DATA tag', () => {
        it('with URI', () => {
            const test = '#EXT-X-SESSION-DATA:DATA-ID="com.example.lyrics",URI="lyrics.json"';
            const parsed = sessionDataParser(test);

            expect(parsed).toHaveProperty('DATA-ID', '"com.example.lyrics"');
            expect(parsed).toHaveProperty('URI', '"lyrics.json"');
        });
        it('with VALUE', () => {
            const test =
                '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="en",VALUE="This is an example"';
            const parsed = sessionDataParser(test);

            expect(parsed).toHaveProperty('DATA-ID', '"com.example.title"');
            expect(parsed).toHaveProperty('LANGUAGE', '"en"');
            expect(parsed).toHaveProperty('VALUE', '"This is an example"');
        });
    });
});
