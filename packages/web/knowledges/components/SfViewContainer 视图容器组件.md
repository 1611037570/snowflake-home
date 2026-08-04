# SfViewContainer 视图容器组件

## 简介

通用的页面布局容器，包含头部 (`Header`)、主内容区和底部 (`SfFooter`)。

## 基础用法

```html
<SfViewContainer>
  <!-- 页面主体内容 -->
  <div>Content</div>
</SfViewContainer>
```

## API 参考

### Slots (插槽)

| 插槽名  | 说明         | 作用域参数 |
| ------- | ------------ | ---------- |
| default | 页面主体内容 | -          |

### 内部组件

- `Header`: 顶部标题栏
- `SfFooter`: 底部组件
