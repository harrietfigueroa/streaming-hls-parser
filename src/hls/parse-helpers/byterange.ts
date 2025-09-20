import * as z from 'zod';

export const byterangeObject = z.object({
    /**
     where n is a decimal-integer indicating the length of the sub-range
     in bytes.  If present, o is a decimal-integer indicating the start of
     the sub-range, as a byte offset from the beginning of the resource.
     If o is not present, the sub-range begins at the next byte following
     the sub-range of the previous Media Segment.
   */
    n: z.number(),
    /**
     where n is a decimal-integer indicating the length of the sub-range
     in bytes.  If present, o is a decimal-integer indicating the start of
     the sub-range, as a byte offset from the beginning of the resource.
     If o is not present, the sub-range begins at the next byte following
     the sub-range of the previous Media Segment.
   */
    o: z.number().optional(),
});

export const byterangeCodec = z.codec(z.union([z.string(), quotedStringCodec]), byterangeObject, {
    decode: (val) => {
        let [n, o] = val.split('@');
        if (n.startsWith('"')) {
            n = n.slice(1);
        }
        if (o?.startsWith('"')) {
            o = o.slice(-1);
        }

        if (val.includes('@') && !o) {
            return z.NEVER;
        }

        const nResult = decimalIntegerSchema.safeDecode(n);
        if (nResult.success) {
            return z.NEVER;
        }

        const oResult = decimalIntegerSchema.safeDecode(o);
        if (oResult.success) {
            return z.NEVER;
        }

        return {
            n: nResult.data,
            o: oResult.data,
        };
    },
    encode: (value) => `${value.n}${value.o ? `@${value.o}` : ''}`,
});
