# SfConfigProvider 全局配置组件

## 简介

用于包裹应用根组件，提供 ElementPlus 的全局配置（如国际化）以及项目级的全局依赖注入。通常在 `App.vue` 或应用的入口处使用。

## 基础用法

```html
<SfConfigProvider>
  <RouterView />
</SfConfigProvider>
```

## API 参考

### Props (属性)

该组件不接受任何 Props，主要用于透传 ElementPlus 配置和提供依赖注入。

### Slots (插槽)

| 插槽名  | 说明                             | 作用域参数 |
| ------- | -------------------------------- | ---------- |
| default | 默认插槽，通常包裹应用的主体内容 | -          |

### Provide (依赖注入)

组件向下层组件提供了以下数据：

- `bg`: 默认背景色配置 (来自 `DEFAULT_BACKGROUND`)
- `color`: 默认文字颜色配置 (来自 `DEFAULT_COLOR`)
