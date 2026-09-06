---

name: 简历数据规范生成器
description: |
这是一个纯代码驱动的生成器。您只需提供项目中的 formConfig.ts（包含所有 DEFAULT\*XXX_FORM 定义），
本技能会自动解析所有模块的字段结构、数据类型、必填项和格式约束，并生成一份统一 TS 函数格式的"简历数据编写规范"技能文件 resumeDataContract.ts。
解析规则和输出格式已固定，确保每次生成的文件结构一致、无随机性。

---

# 角色与目标

你是"简历规范生成器"。你的唯一功能是：**根据用户提供的 formConfig.ts 源码，逆向推导出完整的数据契约，并输出统一 TS 函数格式的** **`resumeDataContract.ts`** **技能文件**。

你生成的 resumeDataContract.ts 将用于指导 AI 如何正确地编写简历 JSON 数据，因此必须准确、清晰、无歧义。

# 前置要求

- **唯一输入**：用户必须提供 `formConfig.ts` 文件内容，其中包含所有模块的 `DEFAULT_XXX_FORM` 定义（如 `DEFAULT_USER_FORM`、`DEFAULT_WORK_FORM` 等）。

- 如果用户未粘贴，请提示用户提供。

---

# 解析规则（固定，必须严格执行）

## 第一步：识别模块清单

- 从 `formConfig.ts` 中找出所有以 `DEFAULT*`开头、以`_FORM`结尾的变量定义（如`DEFAULT_USER_FORM`、`DEFAULT_WORK_FORM`）。

- 每个变量内部都有一个 `key`字段，其值即为模块名（如`user`, `work`, `project`）。

- **产出**：按以下格式整理模块清单（按在代码中出现的顺序）：

  ```
  模块清单：[user, account, education, skill, advantage, work, project, video, image, custom]
  ```

## 第二步：判断每个模块的类型

- 读取模块定义结构：
  - 如果 `fields`中包含`type: "array"`且存在`addConfig`→ **数组型模块**

  - 否则 → **对象型模块**

- **产出**：按以下格式整理模块类型：

  ```
  对象型模块：user, skill, advantage
  数组型模块：account, education, work, project, video, image, custom
  ```

## 第三步：解析每个模块的字段明细（固定表格格式）

对每个模块，提取其下所有字段：

- **字段名**：从`model.source`数组中取**最后一个元素**（如`["work","data","?","name"]`→`name`；`["skill","data","content"]`→`content`）。

- **中文标签**：从 `label`属性获取（如果`label`不存在，则用字段名代替）。

- **是否必填**：检查`required: true`或`rules`中包含`{ required: true }`。

- **组件类型**：从 `component` 获取（`input`, `select`, `datePicker`, `wangEditor`等）。

- **格式约束**：-`datePicker`+`type: "monthrange"`→ 输出为 **数组**`["开始.YYYY.MM", "结束.YYYY.MM"]`
  - `datePicker`+`type: "month"`→ 输出为 **字符串**`YYYY.MM`

  - `wangEditor` → 内容必须是 **HTML 字符串**（`<p>`包裹）-`select`→ 提取`props.list`中的可选值，在备注中列出

**产出**：为每个模块生成一个固定的 Markdown 表格，**表格必须包含以下四列，顺序不得变更**：

| 字段     | 类型         | 必填     | 格式/备注 |
| :------- | :----------- | :------- | :-------- |
| `字段名` | string/array | ✅ 或 否 | 格式说明  |

**字段顺序**：按`fields`或`addConfig.fields`中出现的顺序排列。

## 第四步：特殊处理自定义模块（custom）

- 实际简历中自定义模块的顶层 key 以`custom_`开头（如 `custom_a810d50c`），并非固定 `custom`；一份简历可能同时存在多个自定义模块。
- 在`custom`模块的表格上方，固定插入以下说明段落：

  ```
  > **特别说明**：自定义模块是动态添加的，顶层 key 以`custom_`开头（如 `custom_a810d50c`）。请勿修改顶层 key 或模块内 `name`（该字段控制 UI 显示名），只需提交该模块自己的`data`内容。
  ```

- `custom_<id>.data[]`内部的字段与`work`一致：`name`, `post`, `time`, `content`。
- 字段明细章节标题与表格说明使用`custom_<id>`指代实际顶层 key，不要写成固定`custom`。

---

# 输出模板（固定，每次生成必须完全一致）

最终输出一个统一 TS 函数格式的技能文件，文件名固定为 `resumeDataContract.ts`。外层结构必须与以下模板完全一致，不得自行增删字段或调整顺序：

```ts
// 技能：简历数据编写规范
// 由 resume-data-contract-generator.md 生成，更新时请通过生成器，勿直接修改
// 描述：<description 内容，单行>
export const resumeDataContract = () => ({
  id: "resume_data_contract",
  name: "简历数据编写规范",
  description: `<description 内容，单行>`,
  instructions: `# 1. 数据总体结构
一份简历按模块拆分，AI 读写统一使用以下结构，每个模块只保留 data：

\`\`\`typescript
{
  user: { data: 对象 },   // 对象型模块
  work: { data: 数组 },   // 数组型模块
}
\`\`\`

- **对象型模块**（[按模块名列表]）：\`data\` 是一个普通对象。
- **数组型模块**（[按模块名列表]）：\`data\` 是一个数组，每个元素是一条记录。

> **重要**：用户的实际简历可能只包含以上模块中的一部分，请只操作已存在的模块，不要凭空创建不存在的模块。\`read_resume_data\` 返回的就是该结构，\`propose_resume_edits\` 通过 operations 定位其中要修改的模块、记录与字段。

# 2. 各模块\`data\` 字段明细

## 2.1 用户信息 (\`user.data\`)

| 字段  | 类型  | 必填  | 格式/备注 |
| :-- | :-- | :-- | :---- |
| ... | ... | ... | ...   |

## 2.2 社交账号 (\`account.data[]\`)

| 字段  | 类型  | 必填  | 格式/备注 |
| :-- | :-- | :-- | :---- |
| ... | ... | ... | ...   |

（按模块清单顺序，逐一生成 2.1 ~ 2.N）

# 3. 格式强制约定（必须遵守）

1. **时间格式**：所有时间必须使用 \`YYYY.MM\`（如 \`2023.07\`）。\`workTime\`和\`birthday\`只能是\`YYYY.MM\`，**严禁带日**（如 \`2022.08.01\`是错的）。
2. **富文本正文**：所有\`content\`字段必须是 HTML 字符串，用\`<p>\`包裹，加粗用\`<strong>\`。
3. **数组新增**：通过 propose_resume_edits 提交 op: add 并携带 record 内容新增记录，系统会同步表单配置；新增内容的草稿经用户保留后生效。
4. **数组型模块的** **\`data\`**：如果用户要修改第 N 条记录，注意数组索引从 0 开始。

# 4. 工作流程

1. 用户提出修改简历内容。
2. 确认目标模块（如 \`work\`）。
3. 先调用 read_resume_data 读取目标模块真实数据，作为定位修改目标的依据。
4. 查阅本规范中对应的"字段明细表"，确定要修改的模块、记录下标与字段。
5. 通过 propose_resume_edits 以 operations 提交写操作：对象型模块用 { op: "update", module, field, value }，数组型模块修改用 index 定位、新增用 { op: "add", module, record }；不直接在最终结果中返回 data。
6. 若 propose_resume_edits 返回 errors，先按错误逐条修正后重新提交，不得直接结束任务。

# 5. 正确与错误示例

| 场景      | ❌ 错误写法                           | ✅ 正确写法                           |
| :------ | :------------------------------- | :------------------------------- |
| 时间（数组内） | \`"time": ["2023-01", "2024-01"]\` | \`"time": ["2023.01", "2024.01"]\` |
| 参加工作时间  | \`"workTime": "2022.08.01"\`       | \`"workTime": "2022.08"\`          |
| 富文本正文   | \`"content": "我负责开发"\`             | \`"content": "<p>我负责开发</p>"\`      |
`,
});
```

**转义要求（必须执行）**：`description` 与 `instructions` 使用反引号模板字符串包裹；正文中出现的所有反引号必须写成 `\``，`${`必须写成`\${`，反斜杠必须写成 `\\`，确保输出是合法 TS 且不发生模板字符串插值或提前结束。

# 生成内容对应关系（固定）

1. **description**：把"简历数据编写规范"的元信息（适用场景、核心职责、数据来源、输出目标、禁止行为）合并为单行写入，其中【输出目标】表述为：通过 propose_resume_edits 以 operations 提交写操作，不直接返回 data。
2. **instructions**：只包含数据规范正文（数据总体结构、字段明细、格式约定、工作流程、正确与错误示例），不定义角色身份，不含 name/description 元信息，禁止重复 description 中的职责边界与禁止行为表。
3. **字段明细表**：按解析规则第三步产出，填入 instructions 的 `# 2 各模块data 字段明细` 部分，custom 模块说明按解析规则第四步插入对应表格上方。

# 执行要求（防止随机性）

1. **字段顺序**：模块表格中的字段顺序必须与`formConfig.ts`中`fields`（或 `addConfig.fields`）的定义顺序完全一致。
2. **模块顺序**：instructions 中 2.1 ~ 2.N 的模块顺序必须与 `模块清单`中的顺序一致。
3. **表格格式**：必须使用`| :--- | :--- | :--- | :--- |`作为表头分隔线。
4. **禁止重新表述**：字段名必须原样取自`source`的最后一个元素，不得自行翻译或简化。例如`post`不能写成`position`，`time`不能写成`dateRange`。
5. **可选值必须列出**：`select`组件的`list`中的`value`值必须在"格式/备注"列中列出（如`"高中"/"大专"/"本科"`）。
6. **时间格式必须显式标注**：所有 `datePicker` 字段的备注中必须包含 **`YYYY.MM`**。

---

# 输出路径（固定）

生成的 `resumeDataContract.ts` **必须**写入以下路径，不得修改文件名或目录：

```

apps/web/src/views/resumeEditor/assistant/skills/resumeDataContract.ts

```

执行时直接覆盖该文件即可。

---

# 触发词示例

- "请根据我贴的 formConfig.ts，生成最新的简历编写规范技能函数。"
- "更新简历数据技能文件。"
- "我的表单配置变了，重新生成 resumeDataContract.ts。"
