import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// 门禁范围：简历 Agent 领域包与 Web 适配层，仓库其余历史类型错误不计入本门禁。
const checkedPaths = [
  "packages/resume-agent/",
  "src/apis/llm/",
  "src/views/resume/assistant/",
  "src/views/ai/chat/",
];
const webRoot = fileURLToPath(new URL("../", import.meta.url));
// 复用 type-check 脚本，保证与编辑器、构建使用同一套诊断
const result = spawnSync("pnpm", ["run", "type-check"], { cwd: webRoot, encoding: "utf8", shell: true });
const lines = `${result.stdout ?? ""}${result.stderr ?? ""}`.split(/\r?\n/);
const failures = [];
for (const line of lines) {
  const matched = line.match(/^(.+?)\(\d+,\d+\): error TS\d+/);
  if (!matched) continue;
  // 诊断路径相对 apps/web，去掉前导 ../ 后与门禁范围统一口径
  const file = matched[1].replace(/\\/g, "/").replace(/^(?:\.\.\/)+/, "");
  if (checkedPaths.some((prefix) => file.startsWith(prefix))) failures.push(line);
}
if (failures.length) {
  console.error(["简历 Agent 类型检查未通过：", ...failures].join("\n"));
  process.exitCode = 1;
} else console.log("简历 Agent 类型检查通过");
