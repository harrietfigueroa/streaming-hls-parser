// hat-tip https://stackoverflow.com/a/72760489
export type GetOptionalKeys<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]: string | undefined;
};
export type GetRequiredKeys<T> = { [K in keyof T as undefined extends T[K] ? never : K]: string };

export type ExtractedProperties<
    T extends Record<any, any>,
    K extends keyof T,
    U = Pick<T, K>,
> = GetOptionalKeys<U> & GetRequiredKeys<U>;
export function extractProperties<T extends Record<any, any>, K extends keyof T>(
    sourceObject: T,
    keys: K[],
): ExtractedProperties<T, K> {
    const outputObject: ExtractedProperties<T, K> = {} as ExtractedProperties<T, K>;
    for (const [k, v] of Object.entries(sourceObject)) {
        if (keys.includes(k as K)) {
            outputObject[k as keyof ExtractedProperties<T, K>] = v;
        }
    }
    return outputObject;
}
