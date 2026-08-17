---
name: '项目主题规范生成'
description: '读取 tailwind.css 配置并自动生成/更新项目的主题类名使用规范文档。当用户需要更新文档或同步最新主题配置时调用。'
---

# 项目主题类名规范生成器

## 任务目标

读取 `/apps/web/src/styles/tailwind.css` 的 `@theme inline` 块，解析 `--color-sf-*` 变量，生成：

1. 文档 `/knowledges/项目颜色主题使用规范.md`
2. 数据文件 `/apps/web/src/views/color/data.ts`

## 执行步骤

1. **读取**：用 `Read` 读取 `/apps/web/src/styles/tailwind.css`。
2. **解析**：提取 `@theme inline { ... }` 内所有 `--color-sf-*` 变量及其中文注释，去掉前缀得到类名（如 `--color-sf-text-2` → `sf-text-2`）。
3. **分类**：按变量名归类：
   - 状态色：`sf-success` / `sf-warning` / `sf-error` / `sf-info`（含 `-2` 变体）
   - 主题色：`sf-theme` / `sf-theme-2` / `sf-theme-text`
   - 基础色：`sf-base` / `sf-primary` / `sf-page`
   - 文本色：`sf-text` / `sf-text-2` / `sf-text-3`
   - 背景色：`sf-bg` / `sf-bg-2` / `sf-bg-3`
   - 透明色：`sf-transparent` / `sf-transparent-2` / `sf-transparent-3`
   - 边框色：`sf-border`
4. **生成**：
   - 文档章节固定为：概述 / 使用规则 / 预定义主题色列表 / 严格禁止 / 工具类
   - 使用规则：`bg-sf-[name]`、`text-sf-[name]`、`border-sf-[name]`、`hover:bg-sf-[name]`
   - 严格禁止：禁止硬编码色值；**禁止类名加 `/` 后缀**（如 `bg-sf-theme/20` 违规）
   - `data.ts` 按 `export const list = [...]` 格式输出，分组为：主题色 / 辅助色 / 文本色 / 背景色 / 透明色 / 边框，类名格式 `bg-sf-*`

## 示例

```css
@theme inline {
  /* 主题色 */
  --color-sf-theme: var(--sf-theme);
  /* 文本色-2 */
  --color-sf-text-2: var(--sf-text-2);
}
```

```typescript
export const list = [
  {
    name: '主题色',
    list: [{ name: '主题色', class: 'bg-sf-theme' }],
  },
]
```
