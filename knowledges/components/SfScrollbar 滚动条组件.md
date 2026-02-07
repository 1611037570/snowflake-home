# SfScrollbar 滚动条组件

## 简介

基于 Element Plus 的 `ElScrollbar` 组件封装，提供了主题适配。

## 基础用法

```html
<SfScrollbar height="400px">
  <div v-for="item in 20" :key="item">{{ item }}</div>
</SfScrollbar>
```

## API 参考

### Props (属性)

继承所有 `ElScrollbar` 的属性。

### Slots (插槽)

继承所有 `ElScrollbar` 的插槽。

### Exposed (暴露)

透传 `ElScrollbar` 的所有方法和属性。
