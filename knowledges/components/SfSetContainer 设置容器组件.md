# SfSetContainer 设置容器组件

## 简介

左侧导航、右侧内容的设置页布局容器。包含搜索功能和侧边栏导航。

## 基础用法

```html
<SfSetContainer v-model="activeTab" :list="menuList">
  <!-- 右侧内容区域 -->
  <component :is="activeComponent" />
</SfSetContainer>
```

## API 参考

### Props (属性)

| 属性名      | 类型     | 默认值    | 说明                                       |
| ----------- | -------- | --------- | ------------------------------------------ |
| list        | `Array`  | `[]`      | 侧边栏菜单列表，每项包含 `name` 和 `value` |
| width       | `String` | `'500px'` | 内容区域宽度                               |
| height      | `String` | `'600px'` | 内容区域高度                               |
| modelValue  | `any`    | -         | 当前选中的菜单项值 (v-model)               |
| searchValue | `String` | -         | 搜索框的值 (v-model:searchValue)           |

### Slots (插槽)

| 插槽名  | 说明         | 作用域参数 |
| ------- | ------------ | ---------- |
| default | 右侧内容区域 | -          |
