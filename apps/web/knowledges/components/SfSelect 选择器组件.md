# SfSelect 选择器组件

## 简介

基于 Element Plus 的 `ElSelect` 组件封装，简化了选项渲染逻辑，支持通过 `list` 属性直接传入选项数据，并适配了主题样式。

## 基础用法

```html
<SfSelect v-model="value" :list="options" />
```

## API 参考

### Props (属性)

| 属性名     | 类型    | 默认值 | 说明                                               |
| ---------- | ------- | ------ | -------------------------------------------------- |
| list       | `Array` | `[]`   | 选项列表，每项需包含 `name` (标签) 和 `value` (值) |
| modelValue | `any`   | -      | 绑定值 (v-model)                                   |

此外继承 `ElSelect` 的其他属性。

### Slots (插槽)

继承 `ElSelect` 的插槽。

### Exposed (暴露)

透传 `ElSelect` 的所有方法和属性。

### 依赖注入

- `bg`: 注入背景色类名。
