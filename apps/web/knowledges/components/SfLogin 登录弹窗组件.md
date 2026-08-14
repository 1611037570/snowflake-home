# SfLogin 登录弹窗组件

## 简介

全局登录弹窗组件，通常配合 `useUserStore` 使用。

## 基础用法

```html
<!-- 放置在 App.vue 根节点 -->
<SfLogin />
```

## API 参考

### 依赖说明

- **useUserStore**: 监听 `loginVisible` 状态控制显示隐藏。
- **SfModal**: 内部使用 `SfModal` 作为弹窗容器。
