# SfList 列表组件

## 简介

通用的列表渲染组件，支持选中高亮、悬停效果和自定义插槽。

## 基础用法

```html
<SfList :list="menuList" activeKey="id" :activeValue="currentId" @onClick="handleSelect" />
```

## API 参考

### Props (属性)

| 属性名      | 类型      | 默认值 | 说明                   |
| ----------- | --------- | ------ | ---------------------- |
| list        | `Array`   | `[]`   | 数据列表               |
| activeKey   | `String`  | `''`   | 用于判断激活状态的键名 |
| activeValue | `any`     | -      | 当前激活的值           |
| border      | `Boolean` | `true` | 是否显示分隔线         |

### Events (事件)

| 事件名  | 参数                         | 说明             |
| ------- | ---------------------------- | ---------------- |
| onClick | `(item: any, index: number)` | 列表项点击时触发 |

### Slots (插槽)

| 插槽名  | 说明             | 作用域参数 |
| ------- | ---------------- | ---------- |
| default | 自定义列表项内容 | `item`     |
