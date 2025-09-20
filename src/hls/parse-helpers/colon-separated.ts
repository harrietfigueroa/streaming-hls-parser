import { z } from 'zod';

export const colonSeparatedValue = z.templateLiteral([z.string(), ':', z.string()]).pipe(
    z.transform((str) => {
        const [key, value] = str.split(':');
        return value;
    }),
);
