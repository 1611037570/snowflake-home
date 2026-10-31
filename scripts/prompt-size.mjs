#!/usr/bin/env node
// 统计各智能体提示词与工具声明的体积：pnpm prompt:size
// 统计脚本依赖各 workspace 包的 TypeScript 源码，这里先打包再执行，避免额外安装运行器。
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// 脚本位于仓库根 scripts 目录，向上取到仓库根与 Web 应用根
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const webRoot = join(repoRoot, "apps/web");

const outDir = await mkdtemp(join(tmpdir(), "prompt-size-"));
const outfile = join(outDir, "promptSize.mjs");

try {
  await build({
    entryPoints: [join(scriptDir, "promptSize.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    logLevel: "error",
    // 与 vite 保持一致的路径别名，业务包按仓库内源码解析
    alias: {
      "@": join(webRoot, "src"),
      "@snowflake/resume-agent": join(repoRoot, "packages/resume-agent"),
      "@snowflake/resume-core": join(repoRoot, "packages/resume-core"),
      "@snowflake/interview-agent": join(repoRoot, "packages/interview-agent"),
      "@snowflake/agent": join(repoRoot, "packages/agent/index.ts"),
      "@snowflake/ai": join(repoRoot, "packages/ai/src/index.ts"),
    },
  });
  execFileSync(process.execPath, [outfile], { stdio: "inherit" });
} finally {
  await rm(outDir, { recursive: true, force: true });
}
