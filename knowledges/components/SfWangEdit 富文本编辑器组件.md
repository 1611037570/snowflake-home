# SfWangEdit 富文本编辑器组件

## 简介

基于 `wangeditor-next` 封装的富文本编辑器，适配了 Snowflake 主题样式。

## 基础用法

```html
<SfWangEdit v-model="content" height="400px" />
```

## API 参考

### Props (属性)

| 属性名     | 类型     | 默认值         | 说明                       |
| ---------- | -------- | -------------- | -------------------------- |
| modelValue | `String` | `'<p>...</p>'` | 绑定的 HTML 内容 (v-model) |
| height     | `String` | `'300px'`      | 编辑器高度                 |

### 功能说明

- **主题适配**：自定义了工具栏和编辑区域的背景色、文字颜色，使其适应 dark/light 模式。
- **资源销毁**：组件卸载时自动销毁编辑器实例。
