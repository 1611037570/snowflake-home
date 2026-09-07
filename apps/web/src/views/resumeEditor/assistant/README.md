# resumeEditor assistant 目录说明

依赖方向固定为单向，方便接手维护：

```text
index.vue（薄入口）
  → useResumeAssistant（唯一组装器）
       → skills（技能清单与内容）
       → resumeContext（简历数据上下文）
       → resumeTools（简历工具）
       → flows（引导流程与建议卡片，由调用方注入 Chat）
  → chat（通用聊天 UI 与请求执行）
       → useChatRequest / llm.react（请求引擎）
```

各文件职责：

- `index.vue`：只负责拿到组装产物并渲染 Chat。
- `useResumeAssistant.ts`：唯一组装器，产出 config 与创建对话方法，不再有第二处拼装。
- `skills/registry.ts`：声明常驻与按需技能，新增技能只需加文件并在清单登记。
- `skills/*`：只产出统一 Skill 内容，不依赖运行时。
- `resumeContext.ts`：集中简历数据读取、头像裁剪。
- `resumeTools.ts`：只定义简历工具。
- `flows.ts`：只提供引导流程与建议卡片数据。
- `chat/*`：只做消息 UI 与请求执行，业务内容由 props/config 注入；不得反向 import 上层业务。
