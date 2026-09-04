import type { ReactTool } from "./types";

// 工具注册表：按名称管理工具，执行器据此查找并调用
export class ToolRegistry {
  private tools = new Map<string, ReactTool>();

  register(tool: ReactTool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string) {
    return this.tools.get(name);
  }
}
