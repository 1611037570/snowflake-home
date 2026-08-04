# SfMixImg 混合图片组件

## 简介

智能图片展示组件，支持图片 URL、图标名称或首字母字符串三种模式。

## 基础用法

```html
<!-- 显示图片 -->
<SfMixImg type="img" value="https://..." />

<!-- 显示图标 -->
<SfMixImg type="icon" value="mdi:home" />

<!-- 显示首字母 -->
<SfMixImg type="str" value="User" />
```

## API 参考

### Props (属性)

| 属性名 | 类型     | 默认值  | 说明                             |
| ------ | -------- | ------- | -------------------------------- |
| type   | `String` | `'img'` | 类型，可选 `img`, `icon`, `str`  |
| value  | `String` | `''`    | 内容值（图片地址/图标名/字符串） |
| size   | `Number` | `24`    | 尺寸大小 (px)                    |
