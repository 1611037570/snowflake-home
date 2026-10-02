# 个人信息模块外观

个人信息（user）模块的外观拆分为「分发器 + 外观组件」，与模块标题（`moduleTitle/`）同一套做法。

```text
userContainer/index.vue        分发器：按解析后的主题编号取外观组件
userContainer/registry.ts      外观注册表与主题编号映射
userContainer/themes/*.vue     外观组件：自带根元素、绘制层与内容排布
```

## 约定

1. **根元素归外观组件**：分发器不做任何包裹，模块的 `resume-module-wrapper` / `data-module` / `data-theme` / 行高字号样式都由外观组件落在自己的根元素上，避免多包一层改变布局。
2. **交互事件靠透传**：分发器发出的 `mouseenter` 会作为原生监听挂到外观组件根元素上，外观组件不得声明同名 `emits`。
3. **装饰元素保持一致**：每个外观都渲染 `__surface` / `__accent` / `__line--soft` / `__line--theme` 四个装饰元素，由外观自己的样式决定显示与形态，主题作者改写外观时无需新增结构。
4. **主题编号取值**：`ui.theme.userModule` 为 `auto` 时跟随整体主题，取值可能是任意主题编号。未登记的主题一律使用 `default` 外观。
5. **新增外观**：新增 `themes/<id>.vue` 并在注册表登记，再把主题编号映射过去；调整外观时用样式主题画廊的结构指纹核对无变化。

## 当前状态

| 外观       | 覆盖主题         | 表现                      |
| ---------- | ---------------- | ------------------------- |
| `default`  | 未登记的其余主题 | 不绘制装饰                |
| `minimal`  | `minimal`        | 内容水平居中              |
| `classic`  | `classic`        | 底部留出 12px 间距        |
| `academic` | `academic`       | 内容居中 + 双分隔线       |
| `business` | `business`       | 浅色底托圆角块 + 左侧竖条 |
| `creative` | `creative`       | 浅色底托圆角块 + 右侧竖条 |
| `fresh`    | `fresh`          | 大圆角浅色底托            |
| `vivid`    | `vivid`          | 浅色底托 + 主题色描边     |
| `steady`   | `steady`         | 左侧主题色细竖条          |
