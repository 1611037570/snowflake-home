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
3. **主题编号兼容**：`ui.theme.userModule` 为 `auto` 时跟随整体主题，取值可能是任意主题编号。`userAppearanceByTheme` 未登记的主题一律回退 `legacy` 外观，保证历史简历不因拆分而改变外观。
4. **一次只拆一个主题**：拆分某个主题时，把 `legacy` 里对应的 `[data-theme="x"]` 分支搬进独立外观组件，然后在 `userAppearanceByTheme` 登记该主题；搬完再从 `legacy` 删除该分支，每次都用样式主题画廊的结构指纹核对无变化。

## 当前状态

| 外观     | 覆盖主题 | 状态                       |
| -------- | -------- | -------------------------- |
| `legacy` | 全部主题 | 已落地（原样保留既有分支） |
