import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const failures = []; // 违反简历公共依赖边界的文件与说明
const inspect = async (directory, pattern, message) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspect(target, pattern, message);
    else if (entry.name.endsWith(".ts")) {
      const content = await readFile(target, "utf8");
      if (pattern.test(content)) failures.push(`${path.relative(sourceRoot, target)}：${message}`);
    }
  }
};
// 静态文件清单可用于编号校验，但领域配置禁止直接加载视图模块。
await inspect(path.join(sourceRoot, "domain/resume"), /(?:from\s*|import\s*\()\s*["']@\/views\//, "领域配置依赖视图模块");
await inspect(path.join(sourceRoot, "stores/modules/resume"), /(?:from\s*|import\s*\()\s*["']@\/views\/resume\/theme/, "存储模块依赖主题视图");
// AI 请求层只依赖请求库与领域能力，禁止反向引用功能视图。
await inspect(
  path.join(sourceRoot, "views/resume/ai/request"),
  /(?:from\s*|import\s*\()\s*["'](?:@\/views\/resume\/(?:editor|mine)|\.\.\/.*(?:editor|mine))/,
  "AI 请求层依赖功能视图",
);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log("简历配置依赖边界检查通过");
