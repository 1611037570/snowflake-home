# SfTab 标签页组件

## 简介

自定义样式的 Tab 切换组件，具有平滑的背景跟随动画。

## 基础用法

```html
<SfTab v-model="activeKey" :list="tabList" />
```

## API 参考

### Props (属性)

| 属性名      | 类型     | 默认值 | 说明                                    |
| ----------- | -------- | ------ | --------------------------------------- |
| list        | `Array`  | -      | Tab列表，每项需包含 `name` 和 `value`   |
| activeIndex | `number` | -      | 默认选中的下标 (不推荐，建议用 v-model) |
| modelValue  | `any`    | -      | 当前选中的值 (v-model)                  |

### Events (事件)

| 事件名 | 参数                          | 说明            |
| ------ | ----------------------------- | --------------- |
| change | `(value: any, index: number)` | 切换 Tab 时触发 |

### 功能说明

- 支持鼠标悬停时的背景预览效果。
- 选中项高亮显示，背景块平滑移动。
