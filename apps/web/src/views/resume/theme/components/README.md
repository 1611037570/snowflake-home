# 简历主题外观组件

简历预览里所有「按主题换外观」的部位都走同一套约定：**用编号取自己的组件，未登记时走 `default` 组件**，不再用样式表 + `data-theme` 分支。

## 目录与命名约定

- 目录名 = **部位 + 角色**：`<部位>Module` 放内容组件，`<部位>Container` 放外观组件（分发器 + `themes/` + 注册表）。
- `themes/` 里的文件名 = **它服务的编号**：通用或槽位缺省用语义名（`default`、`mainDefault`），具体主题的定制外观直接复用**主题编号**（`userBand`、`frame`、`vivid`、`angledLine`），不再另造一套外观词汇。

| 部位     | 内容目录        | 外观目录           | 编号来源                    |
| -------- | --------------- | ------------------ | --------------------------- |
| 模块标题 | —               | `moduleTitle/`     | `ui.theme.title`            |
| 模块外框 | —               | `moduleContainer/` | `ui.theme.module`           |
| 条目容器 | —               | `itemContainer/`   | `ui.theme.item`             |
| 个人信息 | `userModule/`   | `userContainer/`   | `ui.theme.userModule`       |
| 顶部标语 | `sloganModule/` | —（见下）          | —                           |
| 区域     | —               | `regionContainer/` | `ui.theme.region[槽位]`     |
| 页面     | —               | `pageContainer/`   | `ui.page.backgroundPattern` |

顶部标语目前只有内容组件（标题 + 标语两行），没有模块级外观变体：它的样子由**区域外观**决定（`regionContainer/themes/sloganBand*.vue`，通栏色带）。若以后要按主题换标语模块内部的排布，再按上面的约定加一个 `sloganContainer/`。

## 注册表约定

注册表统一由 `appearanceRegistry.ts` 的 `createAppearanceRegistry` 创建：

```ts
export const itemAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 必须提供：未登记的主题与未知编号都走它
  vivid: VividAppearance, // 键就是主题编号，主题不必再声明一次外观编号
});
export const resolveItemAppearance = (themeId: unknown) =>
  itemAppearanceRegistry.resolve(themeId);
```

- **键就是编号，缺省是 `default`**：主题只要不特别声明，就自动走 `default`，新增主题不需要额外登记。

## 外观组件约定

1. **自带根元素**：分发器不做任何包裹，根类名、`data-*` 标记、行高字号样式都由外观组件落在自己的根元素上，避免多包一层改变布局。
2. **需要什么自己取**：能从预览上下文（`ui`、主题编号等）读到的信息，由组件自己读取，不通过分发器层层传参；只有分页层才知道的信息（分片区间、装饰类型）才作为参数传入。
3. **影响测量的值必须两处一致**：内边距、字号等由同一个组件渲染预览与测量树，天然一致；纯装饰（绝对定位的色带、边框层、细线）不参与布局。
4. **交互事件靠透传**：分发器发出的 `mouseenter` 等事件会作为原生监听挂到外观组件根元素上，外观组件不得声明同名 `emits`。
5. **几何声明与视觉分离**：圆角、内边距这类既影响外观又要在别处读取的值，由外观组件自己声明（例如条目外观把圆角常量传给共享分片规则），不要再建集中样式表。
