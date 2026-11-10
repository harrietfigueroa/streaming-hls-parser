// The Vitest configuration the profiling workloads run under. The include
// pattern below matches only their suffix, which the default test and benchmark
// patterns do not, so the test and benchmark runs never pick them up. Each file gets its own forked
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
