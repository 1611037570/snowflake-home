---
name: '简历模板配置同步'
description: '按最新默认表单配置同步简历模板数据文件（如 xiaoYangData.ts），对齐模块与字段结构。当用户提到简历模板数据与表单字段有差异、需要更新模板数据或配置时调用。'
---

# 简历模板配置同步

## 任务目标

以最新默认表单配置 `apps/web/src/stores/modules/resume/formConfig.ts` 为唯一标准，同步简历模板数据文件（如 `apps/web/src/stores/modules/resume/xiaoYangData.ts`），使模板的数据与表单配置的模块、字段结构保持一致。

## 参考源与目标

- **参考源（唯一标准）**：`apps/web/src/stores/modules/resume/formConfig.ts`
- **目标文件**：`apps/web/src/stores/modules/resume/xiaoYangData.ts`（包含 `xiaoYangData` 数据、`xiaoYangFixedForm` 固定表单、`xiaoYangForm` 可拖拽表单）
- 仅对比这两个文件即可解决字段差异，**不要排查其他文件**

## 模块与字段对应关系

formConfig.ts 中的默认配置：

| 模块 key | 配置常量 | 数据结构 |
| --- | --- | --- |
| user | DEFAULT_USER_FORM | position/name/birthday/phone/email/workTime/sex |
| account | DEFAULT_ACCOUNT_FORM | collapsed + data: [{name, url}] |
| education | DEFAULT_EDUCATION_FORM | collapsed + data: [{name, education, post, time, content, mode}] |
| skill | DEFAULT_SKILL_FORM | collapsed + data(html) |
| advantage | DEFAULT_ADVANTAGE_FORM | collapsed + data(html) |
| work | DEFAULT_WORK_FORM | collapsed + data: [{name, post, time, content}] |
| project | DEFAULT_PROJECT_FORM | collapsed + data: [{name, post, time, content}] |
| custom | DEFAULT_CUSTOM_FORM | collapsed + name + data: [{name, post, time, content}] |

## 同步规则

1. **只更新用到的模块**：仅同步模板中实际使用的模块，**不要添加配置未引用的数据**（例如模板配置未包含 advantage/custom 时，数据中就不加）。
2. **数据对齐**：`xiaoYangData` 的字段结构与对应 `model.source` 一一对应；`account` 等数组型模块需为 `{ collapsed, data: [...] }` 结构。
3. **固定表单对齐**：`xiaoYangFixedForm` 需与 `DEFAULT_USER_FORM` 完全一致（tip 文案、rules 校验规则、props 等）。
4. **可拖拽表单对齐**：`xiaoYangForm` 各模块结构与 formConfig.ts 中对应配置一致：
   - `boxCollapse` 模块：`props.name` / `props.add`、`model` 绑定 `collapsed`
   - 数组子项：`list: []` + `addConfig`（含 `model` 绑定与 `component`）
   - work/project/custom 子项：`addConfig` 使用 `itemCollapse` + 嵌套 `fields`（公司/岗位/时间/经历，时间用 `datePicker` `monthrange`）
   - 文本编辑：`wangEditor` 组件绑定 `modelValue`

## 执行步骤

1. 用 `Read` 读取 `formConfig.ts` 与目标模板文件。
2. 对比模板数据（`xiaoYangData`）与最新表单各模块的字段差异。
3. 按上述规则修改目标文件（仅修改存在差异的部分）。
4. 用 `GetDiagnostics` 确认无语法错误。

## 示例

数据中 account 应为对象结构（配置 model 绑定 `account.collapsed` 与 `account.data`）：

```typescript
account: {
  collapsed: ["1"],
  data: [
    { name: "github", url: "https://github.com/xxx" },
  ],
},
```

若配置中未引用 `advantage` / `custom` 模块，则数据中**不要**添加对应字段。
