# SfFooter 页脚组件

## 简介

通用的页脚组件，包含版权信息、导航链接以及捐赠、关于弹窗。

## 基础用法

```html
<SfFooter :banner="true" />
```

## API 参考

### Props (属性)

| 属性名 | 类型      | 默认值 | 说明                |
| ------ | --------- | ------ | ------------------- |
| banner | `Boolean` | `true` | 是否显示底部 Banner |

### 内部组件

- `Donation`: 捐赠弹窗
- `Banner`: 底部横幅
- `About`: 关于弹窗
