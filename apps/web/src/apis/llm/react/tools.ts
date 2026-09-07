import type { ReactTool } from "./types";

// 工具注册表：按名称管理工具，执行器据此查找并调用
export class ToolRegistry {
  private tools = new Map<string, ReactTool>();

  register(tool: ReactTool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string) {
    const exact = this.tools.get(name);
    if (exact) return exact;
    // 容错匹配：模型可能漏写或多写工具名后缀，唯一前缀命中时采用该工具
    const candidates = [...this.tools.keys()].filter(
      (key) => key.startsWith(name) || name.startsWith(key),
    );
    return candidates.length === 1 ? this.tools.get(candidates[0]) : undefined;
  }
}
