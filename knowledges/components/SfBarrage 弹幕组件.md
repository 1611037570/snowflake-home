# SfBarrage 弹幕组件

## 简介

轻量级弹幕组件，支持多轨道、自动循环、防重叠。

## 基础用法

```html
<SfBarrage :list="barrageList" containerSelector=".barrage-container" />
```

## API 参考

### Props (属性)

| 属性名            | 类型      | 默认值                      | 说明             |
| ----------------- | --------- | --------------------------- | ---------------- |
| list              | `Array`   | `[]`                        | 弹幕数据列表     |
| itemHeight        | `Number`  | `40`                        | 每行弹幕高度     |
| spacing           | `Number`  | `10`                        | 轨道间距         |
| topMargin         | `Number`  | `80`                        | 顶部保留边距     |
| containerSelector | `String`  | `'.data-barrage-container'` | 弹幕容器的选择器 |
| loop              | `Boolean` | `true`                      | 是否循环播放     |

### 功能说明

- **智能轨道管理**：自动计算最大轨道数，寻找空闲轨道插入弹幕。
- **排队机制**：无空闲轨道时进入等待队列。
- **生命周期**：处理弹幕进入 (`handleEnter`) 和离开 (`handleLeave`) 事件，实现无缝循环。
