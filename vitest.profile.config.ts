// The Vitest configuration `npm run profile` runs the workloads under. Its files
// end in .profile.ts, outside the default test and benchmark patterns, so
// `npm test` and `npm run bench` never run them. Each file gets its own forked
// process, which is what Node's --cpu-prof profiles and writes at exit. Vite's
// module runner reads every import through an export getter, which the profile
// would count against this library's cross-module calls, so the workloads
// import natively.
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["bench/profile/*.profile.ts"],
        pool: "forks",
        fileParallelism: false,
        experimental: { viteModuleRunner: false },
    },
});
