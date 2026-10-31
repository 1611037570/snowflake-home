import { isResumeMediaField } from "@snowflake/resume-core/schema/resumeMedia";
import type {
  ResumeFieldSchema,
  ResumeModuleKind,
  ResumeModuleSchema,
  ResumeModuleVariantSchema,
} from "@snowflake/resume-core/schema/resumeSchema";
import { RESUME_SCHEMA } from "@snowflake/resume-core/schema/resumeSchemaRegistry";

const DESCRIPTION =
  "本技能提供由当前简历表单结构自动生成的数据契约。当 AI 需要了解模块、字段、可添加字段、枚举值与时间或富文本格式时必须加载；不得臆造未声明字段。";

const KIND_LABELS: Record<ResumeModuleKind, string> = {
  object: "对象",
  array: "记录数组",
  custom: "自定义记录数组",
};

// 枚举值超过该数量时不在紧凑清单展开，避免目录本身过长
const COMPACT_OPTION_LIMIT = 12;

// 字符串枚举按裸值拼接省去引号，复合值仍按 JSON 保留结构
const formatOptions = (options: unknown[]) =>
  options.map((value) => (typeof value === "string" ? value : JSON.stringify(value))).join(" / ");

const getFieldNotes = (field: ResumeFieldSchema, moduleKey: string) => {
  const notes: string[] = [];
  // 字段表只描述必填属性，操作边界由运行时统一注入。
  notes.push(field.required ? "必填" : "可选");
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

// 紧凑清单只保留影响写入成败的标记，省去逐字段的“可选”说明
const getCompactFlags = (field: ResumeFieldSchema, moduleKey: string) => {
  const flags: string[] = [];
  if (field.required) flags.push("必填");
  if (isResumeMediaField(moduleKey, field.key)) flags.push("媒体禁写");
  if (field.addable) flags.push("可添加");
  if (field.format === "html") flags.push("HTML");
  if (field.format === "month") flags.push("YYYY.MM");
  if (field.key === "endTime") flags.push("可填至今");
  if (field.format === "heightWeight") flags.push("{height,weight}");
  if (field.component === "measurements") flags.push("{bust,waist,hip}");
  if (field.component === "sizes") flags.push("{top,bottom,shoes}");
  if (field.component === "positionPicker") flags.push("可自定义岗位名");
  // 月份字段的格式约束已由 format 标记与“可填至今”表达，重复的正则文案不再追加
  const monthCovered = field.format === "month";
  if (field.pattern && !monthCovered) {
    flags.push(field.pattern.message || `匹配 /${field.pattern.source}/`);
  }
  if (field.options?.length) {
    flags.push(
      field.options.length <= COMPACT_OPTION_LIMIT
        ? `可选值 ${formatOptions(field.options)}`
        : "枚举需读取模块详情",
    );
  }
  return flags.length ? `（${flags.join("；")}）` : "";
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

// 紧凑清单每个数据形态占一行：模块 key、标题、结构与字段名，便于一次读完所有模块
const renderCompactModule = (module: ResumeModuleSchema) => {
  const variants = module.variants?.length ? module.variants : [module];
  const kinds = [...new Set(variants.map((variant) => KIND_LABELS[variant.kind]))].join(" / ");
  const fields = variants
    .map((variant) => {
      const list = variant.fields
        .map((field) => `${field.key}${getCompactFlags(field, module.key)}`)
        .join("、");
      // 多形态模块需标明字段属于哪个形态，否则写入时无法判断字段归属
      const shape = variants.length > 1
        ? `${KIND_LABELS[variant.kind]}${variant.layout ? `[${variant.layout}]` : ""}：`
        : "";
      return `${shape}${list}`;
    })
    .join("；");
  return `| \`${module.key}\` | ${module.title} | ${kinds} | ${fields} |`;
};

// 总体结构的通用说明在各类正文中共用
const STRUCTURE_NOTES = `- 对象模块通过 \`updateModule\` 修改字段。
- 数组模块通过 \`updateRecord\`、\`addRecord\`、\`deleteRecord\`、\`moveRecord\` 修改记录。
- 同一模块存在多种数据形态时，\`read_resume_data\` 只返回当前界面布局生效的形态；必须按本次返回的对象或数组选择写操作，不得读取或修改未生效形态。
- 字段标记为“可添加”时，即使当前数据缺失，也允许 \`updateModule\` 首次写入。
- 修改现有简历时，当前数据可能只包含模块清单的一部分，不得写入当前数据中不存在的模块；生成新草稿时按入口目标创建相关模块，未提供的具体经历信息使用 XX 占位，不得写成已核实事实。`;

const FORMAT_RULES = `# 强制格式

1. 月份使用 \`YYYY.MM\`；经历仍在持续时，只有结束时间可填 \`至今\`；未知日期留空，不得填写待补充占位。
2. 富文本字段必须是 HTML 字符串；段落使用 \`<p>\`，列表使用 \`<ul>/<ol>\` 与 \`<li>\`，不得提交 Markdown 或未包裹的纯文本。
3. 只能使用以上字段与枚举值，不得根据自然语言自行创建字段名。`;

// 紧凑契约：一次列出全部模块与字段名，字段格式以行内标记说明
const buildCompactInstructions = () => {
  const rows = RESUME_SCHEMA.map(renderCompactModule).join("\n");
  return `# 简历数据总体结构

\`read_resume_data\` 返回以稳定模块 key 为键的对象，每个模块均为 \`{ title, data }\`。\`title\`只用于展示，写操作必须使用模块 key。

| 模块 key | 默认标题 | data 结构 | 字段（括号内为写入要求） |
| :--- | :--- | :--- | :--- |
${rows}

${STRUCTURE_NOTES}
- 需要某个模块字段的完整枚举值与逐字段说明时，带上 \`module\` 参数重新读取该模块。

${FORMAT_RULES}`;
};

// 单模块契约：只渲染目标模块的完整字段表，用于枚举值较多的写入场景
const buildModuleInstructions = (module: ResumeModuleSchema) => {
  const index = RESUME_SCHEMA.indexOf(module);
  return `# 简历数据总体结构

\`read_resume_data\` 返回以稳定模块 key 为键的对象，每个模块均为 \`{ title, data }\`。\`title\`只用于展示，写操作必须使用模块 key。

${STRUCTURE_NOTES}

# 目标模块字段契约

${renderModule(module, index < 0 ? 0 : index)}

${FORMAT_RULES}`;
};

// 全量契约：所有模块的完整字段表，仅供一次性生成整份草稿的入口使用
const buildFullInstructions = () => {
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

${STRUCTURE_NOTES}

# 字段契约

${modules}

${FORMAT_RULES}`;
};

export type ResumeDataContractOptions = {
  // 需要完整字段表的模块 key；省略时返回全部模块的紧凑字段清单。
  module?: string;
  // 是否返回所有模块的完整字段表，供一次性生成整份草稿的入口使用。
  full?: boolean;
};

// 数据规范直接由表单领域结构生成，字段调整后无需维护第二份静态表格
const buildInstructions = (options: ResumeDataContractOptions = {}) => {
  if (options.full) return buildFullInstructions();
  const moduleKey = options.module?.trim();
  if (moduleKey) {
    // 自定义模块的实际 key 以 custom_ 开头，统一按注册的 custom 模块解析
    const target = moduleKey.startsWith("custom_")
      ? RESUME_SCHEMA.find((module) => module.key === "custom")
      : RESUME_SCHEMA.find((module) => module.key === moduleKey);
    if (target) return buildModuleInstructions(target);
  }
  return buildCompactInstructions();
};

export const resumeDataContract = (options?: ResumeDataContractOptions) => ({
  id: "resume_data_contract",
  role: "reference" as const, // 执行过程中按需读取的参考知识。
  name: "简历数据规范",
  description: DESCRIPTION,
  instructions: buildInstructions(options),
});
