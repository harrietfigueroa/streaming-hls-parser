import mediaParser from './parser';

describe('EXT-X-MEDIA', () => {
    it('should parse out the values from an EXT-X-MEDIA tag', () => {
        const test =
            '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",';
        const parsed = mediaParser(test);

        expect(parsed).toHaveProperty('TYPE', 'AUDIO');
        expect(parsed).toHaveProperty('GROUP-ID', '"aac"');
        expect(parsed).toHaveProperty('NAME', '"English"');
        expect(parsed).toHaveProperty('DEFAULT', 'YES');
        expect(parsed).toHaveProperty('AUTOSELECT', 'YES');
        expect(parsed).toHaveProperty('LANGUAGE', '"en"');
    });
});
