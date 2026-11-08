// The Vitest configuration `npm run bench` runs under. Vite's module runner
// reads every import through an export getter, which adds a call to each
// cross-module reference and inflates this library's timings far more than a
// bundled parser's, so the benchmarks import natively, with the hook in
// resolve-ts-extensions.ts mapping the sources' .js specifiers to their files.
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const REPOSITORY_URL = new URL("../", import.meta.url);
const RESOLVE_HOOK_URL = new URL("resolve-ts-extensions.ts", import.meta.url);

const repositoryPath = fileURLToPath(REPOSITORY_URL);
const resolveHookPath = fileURLToPath(RESOLVE_HOOK_URL);

export default defineConfig({
    test: {
        root: repositoryPath,
        pool: "forks",
        execArgv: [`--import=${resolveHookPath}`],
        experimental: { viteModuleRunner: false },
    },
});
