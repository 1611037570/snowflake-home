# SfIcon 图标组件

## 简介

基于 `@iconify/vue` 封装的通用图标组件，支持自动加载、尺寸适配、颜色主题等功能。该组件已全局注册，可直接使用。

## 基础用法

```html
<!-- 基础用法 -->
<SfIcon icon="fa6-solid:snowflake" />

<!-- 自定义大小 -->
<SfIcon icon="fa6-solid:snowflake" size="24" />

<!-- 自定义盒子大小 -->
<SfIcon icon="fa6-solid:snowflake" size="16" boxSize="32" />
```

## API 参考

### Props (属性)

| 属性名  | 类型                         | 默认值                  | 说明                                |
| ------- | ---------------------------- | ----------------------- | ----------------------------------- |
| icon    | `string`                     | `'fa6-solid:snowflake'` | Iconify 图标名称，需在常量表中定义  |
| size    | `number \| string`           | `16`                    | 图标大小，支持数字或字符串          |
| boxSize | `number \| string`           | -                       | 图标容器大小，若不设置默认跟随 size |
| auto    | `boolean`                    | `true`                  | 是否自动适配大小                    |
| rotate  | `number`                     | `180`                   | 图标旋转角度                        |
| flip    | `'horizontal' \| 'vertical'` | `'vertical'`            | 图标翻转方向                        |

### Events (事件)

| 事件名  | 参数 | 说明                           |
| ------- | ---- | ------------------------------ |
| success | -    | 图标加载成功时触发             |
| fail    | -    | 图标加载失败或未找到配置时触发 |

### 常量配置

组件依赖 `ICON_LIST` 常量配置，用于映射图标名称到具体的 Iconify 图标 ID 和默认颜色。
