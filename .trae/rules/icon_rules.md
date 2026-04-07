---
alwaysApply: false
description: 使用图标时必须遵循的规范
---

1. 使用图标时，必须严格遵循 `根目录下的knowledges/components/SfIcon 图标组件.md` 中的定义和 API 规范
2. 图标名称必须使用 iconify 图标库中的图标，并且必须在常量表中声明
3. 图标渲染统一使用 SfIcon 组件，该组件已全局挂载，无需导入
4. **图标尺寸规范**：传入 SfIcon 组件的 `size` 和 `boxSize` 必须是 **Tailwind 间距单位（即 设计稿 px 值 ÷ 4）**。例如设计稿图标大小为 20px 时，必须设置 `size="5"`，禁止直接传入 `"20"`。
