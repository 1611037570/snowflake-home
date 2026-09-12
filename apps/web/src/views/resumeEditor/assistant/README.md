# resumeEditor assistant 目录说明

依赖方向固定为单向，方便接手维护：

```text
index.vue（薄入口）
  → useResumeAssistant（唯一组装器）
       → skills（技能清单与内容）
       → resumeSchemaRegistry（表单配置生成的领域结构）
       → resumeContext（简历数据上下文）
       → tools（简历工具，只提交语义操作）
       → resumeOperationBuffer（请求期间的操作缓冲）
       → flows（引导流程与建议卡片，由调用方注入 Chat）
  → chat（通用聊天 UI 与请求执行）
       → useChatRequest / llm.react（请求引擎）
```

各文件职责：

- `index.vue`：只负责拿到组装产物并渲染 Chat。
- `useResumeAssistant.ts`：唯一组装器，产出 config 与创建对话方法，不再有第二处拼装。
- `skills/registry.ts`：声明常驻与按需技能，新增技能只需加文件并在清单登记。
- `resumeSchema.ts`：将注入的表单结构解析为模块与字段领域结构，不依赖简历业务配置。
- `resumeSchemaRegistry.ts`：在简历域内注入表单配置和选项字典，提供唯一领域结构实例。
- `skills/*`：产出统一 Skill 内容；数据规范直接消费领域结构，不维护静态字段表。
- `resumeEdits.ts`：定义语义化写操作，并基于领域结构统一校验字段与格式。
- `stores/modules/resume/resumeOperations.ts`：定义写操作协议与执行顺序，Store 对外只暴露批量入口。
- `resumeContext.ts`：集中简历数据读取、头像裁剪。
- `tools/*`：定义简历工具，写工具只校验并提交完整语义操作列表。
- `resumeOperationBuffer.ts`：成功回复后整批提交操作，取消或失败时整批丢弃。
- `flows.ts`：只提供引导流程与建议卡片数据。
- `chat/*`：只做消息 UI 与请求执行，业务内容由 props/config 注入；不得反向 import 上层业务。
