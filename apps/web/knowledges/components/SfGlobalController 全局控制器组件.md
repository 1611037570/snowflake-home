# SfGlobalController 全局控制器组件

## 简介

用于管理和渲染全局性的 UI 组件，例如系统监控器 (`SfMonitor`)。该组件通常放置在应用的根层级，根据系统状态（`useSystemStore`）动态显示全局组件。

## 基础用法

```html
<!-- 在 App.vue 或 Layout 中使用 -->
<SfGlobalController />
```

## API 参考

### 依赖说明

该组件与 `useSystemStore` 紧密耦合，主要监听 `monitorWatch` 状态来决定是否显示监控组件。

### Props (属性)

无

### Events (事件)

无
