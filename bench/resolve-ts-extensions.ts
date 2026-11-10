// A Node module hook the benchmarks load with --import, so Vitest can import
// the sources natively. The sources import each other with .js specifiers,
// which tsc resolves to the .ts files and Node's resolver does not.
import { registerHooks, type ResolveHookContext, type ResolveHookSync } from "node:module";

type NextResolve = Parameters<ResolveHookSync>[2];

const SOURCE_EXTENSION = ".ts";
const SPECIFIER_EXTENSION = ".js";
const MODULE_NOT_FOUND_CODE = "ERR_MODULE_NOT_FOUND";

function isModuleNotFound(error: unknown) {
    const isError = error instanceof Error;
    const hasCode = isError && "code" in error;
    return hasCode && error.code === MODULE_NOT_FOUND_CODE;
}

/** Resolves a specifier as Node does, and a .js specifier naming no file as the .ts file beside it. */
function resolveTsExtension(specifier: string, context: Readonly<ResolveHookContext>, nextResolve: NextResolve) {
    try {
        return nextResolve(specifier, context);
    } catch (error) {
        const isJsSpecifier = specifier.endsWith(SPECIFIER_EXTENSION);
        const isMissingJsFile = isJsSpecifier && isModuleNotFound(error);
        if (!isMissingJsFile) {
            throw error;
        }
        const stem = specifier.slice(0, -SPECIFIER_EXTENSION.length);
        return nextResolve(`${stem}${SOURCE_EXTENSION}`, context);
    }
}

registerHooks({ resolve: resolveTsExtension });
