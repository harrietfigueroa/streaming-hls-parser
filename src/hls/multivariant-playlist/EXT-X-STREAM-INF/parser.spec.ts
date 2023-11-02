import streamInfParser from './parser';

describe('EXT-X-STREAM-INF', () => {
    it('should parse out the values from an EXT-X-MEDIA tag', () => {
        const test = '#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5",AUDIO="aac"';

        const values = streamInfParser(test);

        expect(values).toHaveProperty('BANDWIDTH', 65000);
        expect(values).toHaveProperty('CODECS', expect.arrayContaining(['"mp4a.40.5"']));
        expect(values).toHaveProperty('AUDIO', '"aac"');
    });
});
