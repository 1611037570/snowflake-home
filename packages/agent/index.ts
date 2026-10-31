import type { ChatMessage, LLM, ReactConfig, ReactTool } from "@snowflake/ai";

export interface AgentSkill {
  id: string; // 技能稳定标识。
  role: "resident" | "task" | "reference"; // 常驻规则、任务能力或参考资料。
  name: string; // 技能展示名称。
  description: string; // 技能用途摘要。
  instructions: string; // 技能正文。
}

export interface AgentSkillRegistration {
  id: string; // 按需技能的稳定标识。
  role: AgentSkill["role"]; // 技能在当前智能体中的用途。
  name: string; // 技能展示名称。
  description: string; // 规划与参考工具使用的摘要。
  load: () => Promise<AgentSkill>; // 首次使用时加载技能正文。
}

export interface CreateAgentOptions {
  model: LLM; // 由业务方独立解析并注入的模型实例。
  tools: ReactTool[]; // 当前业务明确授权的工具。
  instructions?: string | (() => string); // 业务方提供的规则，不注入任何默认领域提示。
  reactConfig?: Omit<ReactConfig, "tools">; // 工具循环、流式回调与业务完成校验。
  assertActive?: () => void; // 执行和工具调用前检查会话是否仍有效。
}

export interface Agent {
  run: (messages: ChatMessage[]) => Promise<string>; // 在独立运行器中执行当前消息。
  abort: () => void; // 只中止当前智能体的运行器。
}

// 每次创建都有独立工具循环，业务规则与完成策略始终由调用方提供。
export const createAgent = (options: CreateAgentOptions): Agent => {
  options.assertActive?.();
  const runner = options.model.react({
    ...options.reactConfig,
    tools: options.tools.map((tool): ReactTool => ({
      ...tool,
      execute: (args) => {
        options.assertActive?.();
        return tool.execute(args);
      }, // 已停止的会话不能继续调用业务工具。
    })), // 保留业务工具的原始声明与扩展元数据。
  });
  return {
    run: async (messages) => {
      options.assertActive?.();
      const requestMessages = messages.map((message) => ({ ...message }));
      const instructions = typeof options.instructions === "function" ? options.instructions() : options.instructions;
      if (instructions) {
        const userIndex = requestMessages.map((message) => message.role).lastIndexOf("user");
        requestMessages.splice(userIndex < 0 ? 0 : userIndex, 0, {
          role: "system", // 业务规则紧邻本轮输入。
          content: instructions, // 不修改调用方的历史消息。
        });
      }
      const answer = await runner.run(requestMessages);
      options.assertActive?.();
      return answer;
    }, // 会话运行期间不共享消息或业务状态。
    abort: () => runner.abort(), // 取消仅作用于当前运行器。
  };
};

export interface ReferenceToolOptions {
  name: string; // 当前业务的参考资料工具名。
  description: string; // 工具用途说明。
  resources: (AgentSkill | AgentSkillRegistration)[]; // 当前业务允许读取的参考资料。
  // 目录只列标识与名称，用途摘要留在正文里，减少工具声明的固定开销。
  compactCatalog?: boolean;
}

// 只抽取参考资料加载与去重机制，资料目录和工具身份由各业务独立传入。
export const createReferenceTool = (options: ReferenceToolOptions): ReactTool => {
  const references = options.resources.filter((resource) => resource.role === "reference");
  if (!references.length) throw new Error("参考资料不能为空");
  const resourceMap = new Map(references.map((resource) => [resource.id, resource]));
  // 紧凑目录省去逐条摘要，行业与资料名称已能表达适用范围
  const catalog = references
    .map((resource) => options.compactCatalog
      ? `${resource.id}：${resource.name}`
      : `${resource.id}：${resource.name}，${resource.description}`)
    .join("\n");
  const loaded = new Set<string>();
  return {
    name: options.name, // 不使用固定的领域工具名。
    description: `${options.description}\n可选资料：\n${catalog}`, // 按需提供资料目录。
    parameters: {
      type: "object", // 工具参数为对象。
      properties: {
        guidanceId: {
          type: "string", // 资料标识使用字符串。
          enum: references.map((resource) => resource.id), // 只允许读取当前授权目录。
          description: "需要读取的资料标识。", // 本参数的用途说明。
        }, // 本次选择的参考资料。
      }, // 只接受资料标识。
      required: ["guidanceId"], // 必须明确选择一项资料。
      additionalProperties: false, // 不接受目录外参数。
    }, // 沿用通用工具参数协议。
    execute: async (args) => {
      const resource = resourceMap.get(args?.guidanceId);
      if (!resource) return { accepted: false /* 本次未读取资料。 */, error: "未找到对应的参考资料" /* 可恢复的选择错误。 */ };
      if (loaded.has(resource.id)) return {
        accepted: true, // 当前会话已经取得资料。
        alreadyLoaded: true, // 不重复注入正文。
        id: resource.id, // 已加载资料标识。
        name: resource.name, // 已加载资料名称。
      };
      const skill = "load" in resource ? await resource.load() : resource;
      if (skill.id !== resource.id || skill.role !== resource.role || skill.name !== resource.name || skill.description !== resource.description) {
        throw new Error(`参考资料注册不一致：${resource.id}`);
      }
      loaded.add(skill.id);
      return {
        accepted: true, // 本次成功读取资料。
        alreadyLoaded: false, // 首次返回正文。
        id: skill.id, // 资料稳定标识。
        name: skill.name, // 资料展示名称。
        content: skill.instructions, // 本次按需读取的正文。
      };
    }, // 加载状态仅属于当前工具实例。
  };
};
