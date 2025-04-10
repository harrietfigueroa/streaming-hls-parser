import parser from './parser';

describe('#EXT-X-DATERANGE', () => {
    it('should parse', () => {
        const test =
            '   #EXT-X-DATERANGE:ID="splice-6FFFFFF0",DURATION=59.993,SCTE35-IN=0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000,X-CUSTOM-ATTR="foo"';

        const parsed = parser(test);

        expect(parsed).toHaveProperty('ID', '"splice-6FFFFFF0"');
        expect(parsed).toHaveProperty('DURATION', 59.993);
        expect(parsed).toHaveProperty('X-CUSTOM-ATTR', '"foo"');
    });
});
