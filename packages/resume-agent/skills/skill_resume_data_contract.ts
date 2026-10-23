import { isResumeMediaField } from "../schema/resumeMedia";
import type {
  ResumeFieldSchema,
  ResumeModuleKind,
  ResumeModuleSchema,
  ResumeModuleVariantSchema,
} from "../schema/resumeSchema";
import { RESUME_SCHEMA } from "../schema/resumeSchemaRegistry";

const DESCRIPTION =
  "本技能提供由当前简历表单结构自动生成的数据契约。当 AI 需要了解模块、字段、可添加字段、枚举值与时间或富文本格式时必须加载；不得臆造未声明字段。";

const KIND_LABELS: Record<ResumeModuleKind, string> = {
  object: "对象",
  array: "记录数组",
  custom: "自定义记录数组",
};

const formatOptions = (options: unknown[]) =>
  options.map((value) => JSON.stringify(value)).join(" / ");

const getFieldNotes = (field: ResumeFieldSchema, moduleKey: string) => {
  const notes: string[] = [];
  // 经历正文允许生成与优化补写，其他可选空字段仍保持原有边界。
  notes.push(field.required ? "必填" : "可选；生成或优化正文可补写，其他空值不主动补写");
  if (isResumeMediaField(moduleKey, field.key)) notes.push("媒体字段，不向 AI 提供内容，禁止写入");
  if (field.component === "measurements") notes.push("对象：bust（胸围）、waist（腰围）、hip（臀围）为数值文本");
  if (field.component === "sizes") notes.push("对象：top（上装尺码）、bottom（下装尺码）、shoes（鞋码）为文本");
  // 与岗位控件的自定义输入行为一致，提取时保留真实岗位名称。
  if (field.component === "positionPicker") notes.push("允许自定义岗位名称，保留原文，不限于推荐岗位列表");
  if (field.addable) notes.push("可添加字段，缺失时允许通过 updateModule 激活");
  if (field.format === "month") notes.push("格式 YYYY.MM");
  if (field.key === "endTime") notes.push("持续中时填 至今");
  if (field.format === "html") notes.push("HTML 字符串，段落使用 <p>，列表使用 <ul>/<ol> 与 <li>");
  if (field.format === "heightWeight") {
    notes.push("结构 { height: number（身高）, weight: number（体重） }");
  }
  if (field.pattern) notes.push(field.pattern.message || `格式需匹配 /${field.pattern.source}/`);
  if (field.options?.length) notes.push(`可选值 ${formatOptions(field.options)}`);
  return notes.join("；") || "-";
};

const getModuleDataLabel = (module: ResumeModuleSchema, variant: ResumeModuleVariantSchema) => {
  if (variant.kind === "object") return `${module.key}.data`;
  if (variant.kind === "custom") return "custom_<id>.data[]";
  return `${module.key}.data[]`;
};

const renderVariant = (
  module: ResumeModuleSchema,
  variant: ResumeModuleVariantSchema,
  heading: string,
  headingLevel = "###",
) => {
  const rows = variant.fields
    .map(
      (field) =>
        `| \`${field.key}\` | ${field.label} | ${field.valueType} | ${getFieldNotes(field, module.key)} |`,
    )
    .join("\n");
  const customNote =
    variant.kind === "custom"
      ? "> 自定义模块的实际顶层 key 以 `custom_` 开头；标题来自模块 `title`，记录与内置数组模块一样直接写入 `data`。\n\n"
      : "";
  const layoutNote = variant.layout ? `；界面布局为 \`${variant.layout}\` 时生效` : "";
  return `${headingLevel} ${heading}（\`${getModuleDataLabel(module, variant)}\`${layoutNote}）

${customNote}| 字段 | 中文标签 | 类型 | 格式/备注 |
| :--- | :--- | :--- | :--- |
${rows}`;
};

const renderModule = (module: ResumeModuleSchema, index: number) => {
  const variants = module.variants?.length ? module.variants : [module];
  if (variants.length === 1) {
    return renderVariant(module, variants[0]!, `${index + 1}. ${module.title}`, "##");
  }
  const content = variants
    .map((variant, variantIndex) =>
      renderVariant(
        module,
        variant,
        `${index + 1}.${variantIndex + 1} ${module.title}`,
      ),
    )
    .join("\n\n");
  return `## ${index + 1}. ${module.title}\n\n${content}`;
};

// 数据规范直接由表单领域结构生成，字段调整后无需维护第二份静态表格
const buildInstructions = () => {
  const moduleRows = RESUME_SCHEMA.map(
    (module) => {
      const variants = module.variants?.length ? module.variants : [module];
      const kinds = variants.map((variant) => KIND_LABELS[variant.kind]).join(" / ");
      return `| \`${module.key}\` | ${module.title} | ${kinds} |`;
    },
  ).join("\n");
  const modules = RESUME_SCHEMA.map(renderModule).join("\n\n");

  return `# 简历数据总体结构

\`read_resume_data\` 返回以稳定模块 key 为键的对象，每个模块均为 \`{ title, data }\`。\`title\`只用于展示，写操作必须使用模块 key。

| 模块 key | 默认标题 | data 结构 |
| :--- | :--- | :--- |
${moduleRows}

- 对象模块通过 \`updateModule\` 修改字段。
- 数组模块通过 \`updateRecord\`、\`addRecord\`、\`deleteRecord\`、\`moveRecord\` 修改记录。
- 同一模块存在多种数据形态时，\`read_resume_data\` 只返回当前界面布局生效的形态；必须按本次返回的对象或数组选择写操作，不得读取或修改未生效形态。
- 字段表标记为“可添加字段”时，即使当前数据缺失，也允许 \`updateModule\` 首次写入。
- 修改现有简历时，当前数据可能只包含模块清单的一部分，不得写入当前数据中不存在的模块；生成新草稿时按入口目标创建相关模块，未提供的具体经历信息只能作为标记【待核实】的候选，不得写成已核实事实。

# 字段契约

${modules}

# 强制格式

1. 月份使用 \`YYYY.MM\`；经历仍在持续时，只有结束时间可填 \`至今\`；未知日期留空，不得填写待补充占位。
2. 富文本字段必须是 HTML 字符串；段落使用 \`<p>\`，列表使用 \`<ul>/<ol>\` 与 \`<li>\`，不得提交 Markdown 或未包裹的纯文本。
3. 只能使用以上字段与枚举值，不得根据自然语言自行创建字段名。`;
};

export const resumeDataContract = () => ({
  id: "resume_data_contract",
  role: "reference" as const, // 执行过程中按需读取的参考知识。
  name: "简历数据规范",
  description: DESCRIPTION,
  instructions: buildInstructions(),
});
