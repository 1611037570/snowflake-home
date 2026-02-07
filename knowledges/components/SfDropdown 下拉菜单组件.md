# SfDropdown 下拉菜单组件

## 简介

基于 Element Plus 的 `ElDropdown` 组件封装，自动适配当前主题模式。

## 基础用法

```html
<SfDropdown>
  <span>Hover me</span>
  <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item>Action 1</el-dropdown-item>
    </el-dropdown-menu>
  </template>
</SfDropdown>
```

## API 参考

### Props (属性)

继承所有 `ElDropdown` 的属性。

### Slots (插槽)

继承所有 `ElDropdown` 的插槽。

### Exposed (暴露)

透传 `ElDropdown` 的所有方法和属性。

### 功能说明

- **主题适配**：根据 `useThemeStore` 的主题设置自动调整 `effect` (light/dark)。
