# resumeEditor assistant 目录说明

当前入口与依赖关系：

```text
panel/index.vue（异步挂载助手）
  → chat/index.vue（简历会话与引导宿主）
       → useResumeAssistant（唯一工具与技能组装器）
            → skills/registry（常驻与按需技能）
            → resumeContext（读取范围、脱敏与媒体裁剪）
            → tools / resumeEdits / resumeSchemaRegistry（读取、校验与写入）
       → flows / interview（建议卡片、引导与面试交互）
       → useChatRequest / llm.react（请求与工具循环）
       → aiMessage / resumeReport（正文与评分报告）
```

各文件职责：

- `chat/index.vue`：简历会话宿主，消费组装产物，管理引导、话题切换、面试续轮与消息交互。
- `useResumeAssistant.ts`：唯一组装器，产出 config 与创建对话方法，不再有第二处拼装。
- `skills/registry.ts`：声明常驻与按需技能，新增技能只需加文件并在清单登记。
- `resumeSchema.ts`：将注入的表单结构解析为模块与字段领域结构，不依赖简历业务配置。
- `resumeSchemaRegistry.ts`：在简历域内注入表单配置和选项字典，提供唯一领域结构实例。
- `skills/*`：产出统一 Skill 内容；数据规范直接消费领域结构，不维护静态字段表。
- `resumeEdits.ts`：定义语义化写操作，并基于领域结构统一校验字段与格式。
- `stores/modules/resume/resumeOperations.ts`：定义写操作协议与执行顺序，Store 对外只暴露批量入口。
- `resumeContext.ts`：集中简历数据读取、脱敏与读取副本媒体裁剪，不修改原简历媒体。
- `tools/*`：定义简历工具，写工具只校验并提交完整语义操作列表。
- `flows.ts`：只提供引导流程与建议卡片数据。
- `chat/useChatRequest.ts`：请求与工具循环、请求隔离、备份与撤回；当前直接读取默认提示技能，每轮将规则放到最后一条用户消息之前。
- `chat/aiMessage.vue` 与 `resumeReport.ts`：展示正文并校验六维报告；普通或无效 JSON 保留在正文。

字段与 AI 同步约定：

- 业务字段只在 `stores/modules/resume/config/formConfig.ts` 声明；数据契约、读取字段和写入校验必须继续由 `resumeSchema.ts` 生成，不得在技能或工具内另建静态字段表。
- 同一模块同时声明对象字段与数组字段时，数组形态用模块的 `props.addWhenLayout` 声明对应布局值；AI 读取、完成度与写入校验只处理当前布局生效的形态。
- 新增、重命名、删除字段，或调整字段类型、格式、枚举、可添加状态及模块形态时，必须同步核对 `resumeContext.ts`、`resumeEdits.ts`、`skill_resume_data_contract.ts` 和字段快捷处理，确保读取结果、模型契约与写入规则一致。
- 修改字段后必须同步更新上级 `README.md` 的本轮迭代记录，并按其中约定核对全字段范本；没有完成 AI 链路核对，不得视为字段修改完成。
