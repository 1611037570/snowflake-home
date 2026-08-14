# SfApp 应用图标组件

## 简介

展示应用图标和名称，支持自定义图标类型（图片/Icon/文本），集成了右键菜单功能（固定、删除、分享）。

## 基础用法

```html
<SfApp :name="app.name" :value="app.url" :item="app" @click="handleClick" />
```

## API 参考

### Props (属性)

| 属性名   | 类型               | 默认值      | 说明                                                            |
| -------- | ------------------ | ----------- | --------------------------------------------------------------- |
| size     | `Number \| String` | `80`        | 应用容器大小                                                    |
| iconSize | `Number \| String` | `40`        | 图标大小                                                        |
| name     | `Number \| String` | `''`        | 应用名称                                                        |
| type     | `String`           | `'default'` | 类型，`custom` 为自定义模式（无右键菜单），`default` 为默认模式 |
| index    | `Number`           | `-1`        | 在列表中的索引，用于删除/固定操作                               |
| value    | `any`              | `''`        | 应用链接地址                                                    |
| item     | `any`              | -           | 应用完整数据对象，需包含 `imgType`, `imgValue` 等               |

### 功能说明

- **右键菜单**：内置 `SfMenu`，提供重新获取图标、分享、固定/取消固定、删除等功能。
- **点击跳转**：默认模式下点击会根据 `searchStore.openMode` 打开链接。
