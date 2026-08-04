# SfMenu 右键菜单组件

## 简介

自定义右键菜单组件，支持多级菜单、自定义位置和动画效果。

## 基础用法

```html
<SfMenu :list="menuActions">
  <div class="target-area">右键点击区域</div>
</SfMenu>
```

## API 参考

### Props (属性)

| 属性名          | 类型      | 默认值          | 说明                                    |
| --------------- | --------- | --------------- | --------------------------------------- |
| list            | `Array`   | `[]`            | 菜单项列表，每项包含 `name` 和 `fn`     |
| model           | `String`  | `'contextmenu'` | 触发方式，可选 `click` 或 `contextmenu` |
| stopPropagation | `Boolean` | `true`          | 是否阻止冒泡                            |
| preventDefault  | `Boolean` | `true`          | 是否阻止默认行为                        |
| nameKey         | `String`  | `'name'`        | 菜单项显示的键名                        |

### Events (事件)

| 事件名          | 参数          | 说明             |
| --------------- | ------------- | ---------------- |
| onSelected      | `(item: any)` | 选中菜单项时触发 |
| onBeforeCreate  | -             | 菜单打开前触发   |
| onMounted       | -             | 菜单打开后触发   |
| onBeforeUnmount | -             | 菜单关闭前触发   |
| onUnmounted     | -             | 菜单关闭后触发   |
