# SfDynamicForm 动态表单组件

## 简介

根据配置动态生成表单的组件。支持嵌套对象、数组等复杂数据结构，基于 `el-form` 和 `el-row` 布局。

## 基础用法

```html
<SfDynamicForm v-model:form="formConfig" v-model:data="formData" />
```

## API 参考

### Props (属性)

| 属性名 | 类型     | 默认值         | 说明         |
| ------ | -------- | -------------- | ------------ |
| form   | `Object` | `DEFAULT_FORM` | 表单配置对象 |
| data   | `Object` | `DEFAULT_DATA` | 表单数据对象 |

### 依赖注入 (Provide)

- `dataProxy`: 数据代理对象
- `formProxy`: 表单代理对象

### 功能说明

- 组件会校验表单配置的合法性 (`checkForm`)。
- 自动处理 `object` 和 `array` 类型的嵌套表单。
