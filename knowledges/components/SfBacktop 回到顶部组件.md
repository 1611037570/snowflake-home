# SfBacktop 回到顶部组件

## 简介

基于 Element Plus 的 `ElBacktop` 组件封装。自定义了触发按钮样式（使用 `SfIcon`），集成了 `SfTooltip` 提示，并根据窗口大小自动调整可见性。

## 基础用法

```html
<!-- 放置在页面底部 -->
<SfBacktop />
```

## API 参考

### Props (属性)

无（内部硬编码了 `bottom`, `right`, `visibility-height` 等配置）。

### 功能说明

- 当滚动超过 `windowSize.height - 50` 时显示。
- 悬停显示“回到顶部”提示。
- 点击平滑滚动至顶部。
