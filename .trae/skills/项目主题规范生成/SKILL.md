---
name: '项目主题规范生成'
description: '读取 tailwind.css 配置并自动生成/更新项目的主题类名使用规范文档。当用户需要更新文档或同步最新主题配置时调用。'
---

# 项目主题类名规范生成器

本技能用于自动分析 CSS 配置文件，并生成一份最新的主题类名使用规范文档。

## 任务目标

读取 `/src/styles/tailwind.css` 文件中的 `@theme inline` 配置，解析其中的 CSS 变量，并生成一份结构清晰的 Markdown 文档，保存至 `/knowledges/项目颜色主题使用规范.md`。

## 执行步骤

1.  **读取配置文件**
    - 使用 `Read` 工具读取绝对路径文件：`/src/styles/tailwind.css`。

2.  **解析内容**
    - 定位到 `@theme inline { ... }` 代码块。
    - 提取所有 `--color-sf-*` 格式的变量名和对应的注释。
    - 根据变量名后缀进行分类：
      - **状态色**: `sf-success`, `sf-warning`, `sf-error`, `sf-info`
      - **主题色**: `sf-theme`, `sf-theme-hover`, `sf-theme-text`
      - **基础色**: `sf-base`, `sf-primary`, `sf-primary-hover`
      - **文本色**: `sf-text`, `sf-text-2` 等
      - **背景色**: `sf-bg`, `sf-bg-2` 等
      - **透明色**: `sf-transparent` 等
      - **边框色**: `sf-border` 等

3.  **生成文档内容**
    - 文档标题：`# Snowflake主题色使用规范`
    - 文档结构应严格包含以下部分（不要添加其他章节，如"主题色定义位置"等）：
      - **概述**: 简要说明文档是自动生成的，基于 tailwind.css 配置。
      - **使用规则**:
        - 背景: `bg-sf-[name]`
        - 文字: `text-sf-[name]`
        - 边框: `border-sf-[name]`
        - 悬停: `hover:bg-sf-[name]`
      - **预定义主题色列表**: 按上述分类列出所有可用颜色变量。
      - **严格禁止**: 强调禁止使用硬编码色值，只使用提供的主题类名，不允许在提供的类名后面添加/任意数 (如 `bg-sf-theme/20` 是禁止的)。
      - **工具类**: 列出项目中的自定义工具类（如 `flex-c`, `sf-theme-element`, `sf-primary`）。
    - **重要**: 在生成列表时，请保留源码中的中文注释，以便开发者理解每个颜色的用途。

4.  **写入文档**
    - 将生成的 Markdown 内容写入 `/knowledges/项目颜色主题使用规范.md`。
    - 如果该文件已存在，直接覆盖更新。

## 示例输出格式

```markdown
# Snowflake主题色使用规范

## 预定义主题色列表

### 状态色

- `sf-success`: 成功色
- `sf-warning`: 警告色
  ...
```
