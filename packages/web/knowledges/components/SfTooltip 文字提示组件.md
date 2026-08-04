# SfTooltip 文字提示组件

## 简介

基于 Element Plus 的 `ElTooltip` 组件封装。默认根据当前主题 (`useThemeStore`) 调整 `effect` 样式，并提供默认图标。

## 基础用法

```html
<!-- 默认显示问号图标 -->
<SfTooltip content="提示文字" />

<!-- 自定义触发内容 -->
<SfTooltip content="提示文字">
  <button>Hover me</button>
</SfTooltip>
```

## API 参考

### Props (属性)

继承所有 `ElTooltip` 的属性。

### Slots (插槽)

| 插槽名  | 说明                                           | 作用域参数 |
| ------- | ---------------------------------------------- | ---------- |
| default | 触发元素，默认为 `mingcute:question-line` 图标 | -          |
| content | 提示框内容                                     | -          |

### Exposed (暴露)

透传 `ElTooltip` 的所有方法和属性。
