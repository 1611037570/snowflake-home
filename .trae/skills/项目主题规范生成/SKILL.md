---
name: '项目主题规范生成'
description: '读取 tailwind.css 配置并自动生成/更新项目的主题类名使用规范文档。当用户需要更新文档或同步最新主题配置时调用。'
---

# 项目主题类名规范生成器

本技能用于自动分析主题配置并生成最新的主题类名规范文档，适用于主题变量变更后的文档同步场景。

## 任务目标

读取 `/src/styles/tailwind.css` 文件中的 `@theme inline` 配置，解析其中的 CSS 变量，并生成一份结构清晰的 Markdown 文档，保存至 `/knowledges/项目颜色主题使用规范.md`。

## 执行步骤

1. **读取配置文件**
   - 使用 `Read` 工具读取绝对路径文件：`/src/styles/tailwind.css`。
2. **解析内容**
   - 定位 `@theme inline { ... }` 代码块。
   - 提取所有 `--color-sf-*` 格式变量及其中文注释。
   - 变量命名转换规则：
     - `--color-sf-theme` → `sf-theme`
     - `--color-sf-text-2` → `sf-text-2`
   - 根据变量名后缀分类：
     - **状态色**: `sf-success`, `sf-warning`, `sf-error`, `sf-info`
     - **主题色**: `sf-theme`, `sf-theme-hover`, `sf-theme-text`
     - **基础色**: `sf-base`, `sf-primary`, `sf-primary-hover`
     - **文本色**: `sf-text`, `sf-text-2` 等
     - **背景色**: `sf-bg`, `sf-bg-2` 等
     - **透明色**: `sf-transparent` 等
     - **边框色**: `sf-border` 等
3. **生成文档内容与数据文件内容**
   - 文档标题固定为：`# Snowflake主题色使用规范`
   - 文档结构必须严格包含以下章节，禁止新增其他章节：
     - **概述**
     - **使用规则**
     - **预定义主题色列表**
     - **严格禁止**
     - **工具类**
   - 使用规则中必须包含：
     - 背景：`bg-sf-[name]`
     - 文字：`text-sf-[name]`
     - 边框：`border-sf-[name]`
     - 悬停：`hover:bg-sf-[name]`
   - 预定义主题色列表必须按分类输出，并保留中文注释。
   - 严格禁止章节必须明确：
     - 禁止硬编码色值（如 `#409EFF`、`rgba(...)`）
     - **绝对禁止类名后缀拼接**：严禁在主题类名后使用 `/` 拼接任何透明度或任意值（如 `bg-sf-theme/20`、`text-sf-primary/50` 均属违规）。类名后**绝不允许**出现任何带有 `/` 的后缀！
   - 工具类章节列出项目自定义工具类（如 `flex-c`, `sf-theme-element`, `sf-primary`）。
   - 生成用于视图展示的 TS 数据结构，按以下大类组织，并将解析出的类名填入对应分组（类名格式为 `bg-sf-*`）：
     - `主题色`（包含：主题色、基础色等，如 `bg-sf-theme`, `bg-sf-primary`）
     - `辅助色`（包含：状态色，如 `bg-sf-success`）
     - `文本色`（包含：文本色相关的背景展示，如 `bg-sf-text`）
     - `背景色`（包含：背景色，如 `bg-sf-bg`）
     - `透明色`（包含：透明色，如 `bg-sf-transparent`）
     - `边框`（包含：边框色，如 `bg-sf-border`）
4. **写入文档与数据文件**
   - 将生成的 Markdown 内容写入 `/knowledges/项目颜色主题使用规范.md`。
   - 将生成的 TS 数组内容使用 `export const list = [...]` 格式写入 `src/views/color/data.ts` 文件。
   - `data.ts` 数据结构必须严格遵循以下格式：
     ```typescript
     export const list = [
       {
         name: '主题色',
         list: [{ name: '中文注释', class: 'bg-sf-[name]' }],
       },
       // 其他分类...
     ]
     ```
   - 若文件已存在，直接覆盖更新。

## 输入示例

```markdown
@theme inline {
--color-sf-theme: #409eff; /_ 品牌主色 _/
--color-sf-theme-hover: #66b1ff; /_ 品牌主色-悬停 _/
--color-sf-success: #67c23a; /_ 成功色 _/
--color-sf-text-2: #606266; /_ 二级文本色 _/
--color-sf-bg-2: #f5f7fa; /_ 二级背景色 _/
--color-sf-border: #dcdfe6; /_ 默认边框色 _/
}
```

## 分类示例

- `sf-theme`、`sf-theme-hover` → 主题色
- `sf-success` → 状态色
- `sf-text-2` → 文本色
- `sf-bg-2` → 背景色
- `sf-border` → 边框色

## 输出示例

```markdown
# Snowflake主题色使用规范

## 概述

本文档由工具自动生成，基于 `/src/styles/tailwind.css` 中的 `@theme inline` 配置。

## 使用规则

- 背景：`bg-sf-[name]`
- 文字：`text-sf-[name]`
- 边框：`border-sf-[name]`
- 悬停：`hover:bg-sf-[name]`

## 预定义主题色列表

### 主题色

- `sf-theme`: 品牌主色
- `sf-theme-hover`: 品牌主色-悬停

### 状态色

- `sf-success`: 成功色

### 文本色

- `sf-text-2`: 二级文本色

### 背景色

- `sf-bg-2`: 二级背景色

### 边框色

- `sf-border`: 默认边框色

## 严格禁止

- 禁止使用 `#409EFF`、`rgba(...)` 等硬编码颜色值
- **绝对禁止类名后缀拼接**：严禁在主题类名后使用 `/` 拼接任何透明度或任意值（如 `bg-sf-theme/20`、`text-sf-primary/50` 均属违规）。类名后**绝不允许**出现任何带有 `/` 的后缀！

## 工具类

- `flex-c`
- `sf-theme-element`
- `sf-primary`
```
