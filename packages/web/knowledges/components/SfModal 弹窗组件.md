# SfModal 弹窗组件

## 简介

具有 3D 悬浮效果的模态框组件，支持拖拽关闭（需确认逻辑）和 ESC 关闭。

## 基础用法

```html
<SfModal v-model="visible" title="提示"> 内容... </SfModal>
```

## API 参考

### Props (属性)

| 属性名     | 类型      | 默认值 | 说明                       |
| ---------- | --------- | ------ | -------------------------- |
| modelValue | `Boolean` | -      | 控制弹窗显示隐藏 (v-model) |
| title      | `String`  | `''`   | 弹窗标题                   |
| titleClass | `String`  | `''`   | 标题样式类名               |

### 功能说明

- **3D 交互**：鼠标移动时，弹窗会有跟随视角的微量 3D 旋转效果。
- **ESC 关闭**：监听键盘 ESC 键关闭弹窗。
