import * as z from 'zod';

export const playlistTagRegistry = z.registry<{ tag: string }, z.ZodCodec>();
