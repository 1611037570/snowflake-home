# 简历字段变更须知

改动简历的任何业务字段时，必须同步范本数据，否则模板卡片与字段核对会失效。以下两条约定对所有改动者（含 AI）生效。

## 一、字段口径的唯一定义处

业务字段由表单配置声明，字段契约由它生成：

| 用途 | 位置 |
| --- | --- |
| 字段声明（key、标签、组件、字典、校验） | `apps/web/src/stores/modules/resume/config/formConfig.ts` |
| 字段契约生成 | `apps/web/src/views/resume/editor/assistant/resumeSchemaRegistry.ts` |
| 模块与字段的契约文案（供模型与导入使用） | `apps/web/src/views/resume/editor/assistant/skills/skill_resume_data_contract.ts` |

**判断某个字段是否存在，以 `formConfig.ts` 为准**，不要以范本数据为准。

## 二、修改任何字段 → 必须同步范本

范本数据位于 `apps/web/src/views/resume/template/data/resumes/`，每个文件是一份可套用的简历数据，同时被模板卡片缩略图与全屏预览消费。

字段发生下列任一变化时，必须检查并更新**受影响的范本文件**：

| 变更类型 | 需要做的同步 |
| --- | --- |
| 字段重命名 | 所有含该字段的范本文件，以及模板文案键 `resumeTemplateContent_<fileName>_*` |
| 字段取值调整（字典项变化） | 使用该字段的范本取值要改成合法值，避免落到已删除的选项 |
| 字段移除 | 所有范本中删除该字段 |
| 字段新增 | 见下一条 |

范本文件与模板卡片的对应关系在 `apps/web/src/views/resume/template/data/list.ts`，卡片文案在 `apps/web/src/locales/lang/zh/resume.json` 与 `en/resume.json` 的 `resumeTemplateContent_<fileName>_*`。

## 三、新增字段 → 必须同步全字段范本

`resumes/allFields.ts`（卡片名「全字段简历」）是**字段完整性基准**：它覆盖全部模块与全部业务字段，用来核对新字段的展示效果。

**新增任何业务字段后，必须在该文件中补上对应取值。**

不作同步的后果：新字段在范本中缺失，模板预览看不到它的渲染效果，字段回归问题无法通过范本核对发现。

## 四、如何自查是否漏同步

在浏览器控制台（开发环境）执行：

```js
const registry = await import("/src/views/resume/editor/assistant/resumeSchemaRegistry.ts");
const data = await import("/src/views/resume/template/data/resumeData.ts");
const sample = await data.loadResumeTemplateData("allFields.ts");
// 逐个模块比对该模块声明的字段是否都在 sample.data[模块] 中有非空取值
```

预期结果：**每个模块都没有缺失字段**。若出现缺失，说明新增字段未同步到全字段范本。

## 五、模板数据的三类不变式

1. **模块齐全**：`allFields.ts` 必须覆盖字段契约里的全部模块（含自定义模块）。
2. **字段非空**：`allFields.ts` 里每个已声明字段都要有非空取值。
3. **引用完整**：`list.ts` 的每个 `fileName` 都能在 `data/resumes/` 下找到同名文件；两个语言包的 `resumeTemplateContent_<fileName>_*` 与 `resumeTemplateStyle_<id>_*` 文案键齐全，不得出现原始键名。
