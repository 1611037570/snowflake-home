# SfInput 输入框组件

## 简介

基于 Element Plus 的 `ElInput` 组件封装，移除了默认的阴影和背景，适配了 Snowflake 主题系统。

## 基础用法

```html
<SfInput v-model="value" placeholder="请输入内容" />
```

## API 参考

### Props (属性)

继承所有 `ElInput` 的属性。

### Slots (插槽)

继承所有 `ElInput` 的插槽。

### Exposed (暴露)

透传 `ElInput` 的所有方法和属性。

### 依赖注入

- `bg`: 注入背景色类名。
