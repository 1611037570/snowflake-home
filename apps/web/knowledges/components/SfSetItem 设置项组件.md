# SfSetItem 设置项组件

## 简介

统一风格的设置项组件，支持开关、按钮、选择器、时间选择器等多种交互类型。

## 基础用法

```html
<SfSetItem title="深色模式" info="开启后界面变暗" type="switch" v-model="isDark" />
```

## API 参考

### Props (属性)

| 属性名     | 类型      | 默认值     | 说明                                                   |
| ---------- | --------- | ---------- | ------------------------------------------------------ |
| title      | `String`  | `'标题'`   | 设置项标题                                             |
| info       | `String`  | `null`     | 标题下方的辅助说明信息                                 |
| type       | `String`  | `'switch'` | 交互类型，可选值: `switch`, `button`, `select`, `time` |
| config     | `Object`  | `{}`       | 配置对象，用于 `select` 的选项列表或 `placeholder`     |
| divider    | `Boolean` | `true`     | 是否显示底部下划线                                     |
| modelValue | `any`     | -          | 绑定值 (v-model)                                       |

### Events (事件)

| 事件名   | 参数                       | 说明           |
| -------- | -------------------------- | -------------- |
| onChange | `(val: any, type: string)` | 值变化时触发   |
| onClick  | `(val: any, type: string)` | 按钮点击时触发 |
