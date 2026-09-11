import type { ResumeFieldSchema, ResumeModuleKind, ResumeModuleSchema } from "../resumeSchema";
import { RESUME_SCHEMA } from "../resumeSchemaRegistry";

const DESCRIPTION =
  "本技能提供由当前简历表单结构自动生成的数据契约。当 AI 需要了解模块、字段、必填项、可添加字段、枚举值与时间或富文本格式时必须加载；不得臆造未声明字段。";

const KIND_LABELS: Record<ResumeModuleKind, string> = {
  object: "对象",
  array: "记录数组",
  custom: "自定义记录数组",
};

const formatOptions = (options: unknown[]) =>
  options.map((value) => JSON.stringify(value)).join(" / ");

const getFieldNotes = (field: ResumeFieldSchema) => {
  const notes: string[] = [];
  if (field.addable) notes.push("可添加字段，缺失时允许通过 updateModule 激活");
  if (field.format === "month") notes.push("格式 YYYY.MM");
  if (field.format === "monthRange") notes.push('格式 ["开始.YYYY.MM", "结束.YYYY.MM"]');
  if (field.format === "html") notes.push("HTML 字符串，正文使用 <p> 包裹");
  if (field.format === "heightWeight") {
    notes.push("结构 { height: number, weight: number }");
  }
  if (field.options?.length) notes.push(`可选值 ${formatOptions(field.options)}`);
  return notes.join("；") || "-";
};

const getModuleDataLabel = (module: ResumeModuleSchema) => {
  if (module.kind === "object") return `${module.key}.data`;
  if (module.kind === "custom") return "custom_<id>.data.list[]";
  return `${module.key}.data[]`;
};

const renderModule = (module: ResumeModuleSchema, index: number) => {
  const rows = module.fields
    .map(
      (field) =>
        `| \`${field.key}\` | ${field.label} | ${field.valueType} | ${field.required ? "是" : "否"} | ${getFieldNotes(field)} |`,
    )
    .join("\n");
  const customNote =
    module.kind === "custom"
      ? "> 自定义模块的实际顶层 key 以 `custom_` 开头；标题来自模块 `title`，记录写入 `data.list`。\n\n"
      : "";
  return `## ${index + 1}. ${module.title}（\`${getModuleDataLabel(module)}\`）

${customNote}| 字段 | 中文标签 | 类型 | 必填 | 格式/备注 |
| :--- | :--- | :--- | :--- | :--- |
${rows}`;
};

// 数据规范直接由表单领域结构生成，字段调整后无需维护第二份静态表格
const buildInstructions = () => {
  const moduleRows = RESUME_SCHEMA.map(
    (module) => `| \`${module.key}\` | ${module.title} | ${KIND_LABELS[module.kind]} |`,
  ).join("\n");
  const modules = RESUME_SCHEMA.map(renderModule).join("\n\n");

  return `# 简历数据总体结构

\`read_resume_data\` 返回以稳定模块 key 为键的对象，每个模块均为 \`{ title, data }\`。\`title\`只用于展示，写操作必须使用模块 key。

| 模块 key | 默认标题 | data 结构 |
| :--- | :--- | :--- |
${moduleRows}

- 对象模块通过 \`updateModule\` 修改字段。
- 数组模块通过 \`updateRecord\`、\`addRecord\`、\`deleteRecord\`、\`moveRecord\` 修改记录。
- 字段表标记为“可添加字段”时，即使当前数据缺失，也允许 \`updateModule\` 首次写入。
- 当前简历可能只包含模块清单的一部分，不得写入当前数据中不存在的模块。

# 字段契约

${modules}

# 强制格式

1. 月份使用 \`YYYY.MM\`，月份区间必须包含两个值。
2. 富文本字段必须是 HTML 字符串，并使用 \`<p>\` 包裹正文。
3. 只能使用以上字段与枚举值，不得根据自然语言自行创建字段名。`;
};

export const resumeDataContract = () => ({
  id: "resume_data_contract",
  name: "简历数据规范",
  description: DESCRIPTION,
  instructions: buildInstructions(),
});
