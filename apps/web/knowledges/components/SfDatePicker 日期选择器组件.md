# SfDatePicker 日期选择器组件

## 简介

基于 Element Plus 的 `ElDatePicker` 组件封装，移除默认边框并适配了主题文本颜色。

## 基础用法

```html
<SfDatePicker v-model="date" type="date" placeholder="选择日期" />
```

## API 参考

### Props (属性)

| 属性名     | 类型  | 默认值 | 说明             |
| ---------- | ----- | ------ | ---------------- |
| modelValue | `any` | -      | 绑定值 (v-model) |

此外继承 `ElDatePicker` 的其他属性。

### Slots (插槽)

继承 `ElDatePicker` 的插槽。

### Exposed (暴露)

透传 `ElDatePicker` 的所有方法和属性。

### 依赖注入

- `bg`: 注入背景色类名。
