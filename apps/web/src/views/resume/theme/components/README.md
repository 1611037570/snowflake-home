# 简历主题外观组件

简历预览里所有「按主题换外观」的部位都走同一套约定：**按编号取组件，未登记的主题走 `default` 组件**，不再用样式表 + `data-theme` 分支。

| 部位                           | 目录               | 外观编号来源            |
| ------------------------------ | ------------------ | ----------------------- |
| 模块标题                       | `moduleTitle/`     | `ui.theme.title`        |
| 模块外框                       | `moduleContainer/` | `ui.theme.module`       |
| 条目容器                       | `itemContainer/`   | `ui.theme.item`         |
| 个人信息模块                   | `userContainer/`   | `ui.theme.userModule`   |
| 区域（标语 / 个人信息 / 正文） | `regions/`         | `ui.theme.region[槽位]` |

## 注册表约定

注册表统一由 `appearanceRegistry.ts` 的 `createAppearanceRegistry` 创建：

```ts
export const itemAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 必须提供：未登记的主题与未知编号都走它
  vivid: VividAppearance,
});
export const resolveItemAppearance = (themeId: unknown) =>
  itemAppearanceRegistry.resolve(themeId);
```

- 外观编号与主题编号同名时不需要别名表；需要把主题编号映射到别的外观时传第二个参数 `aliases`。
- 必须提供 `default`，这样新增主题不需要同时新增外观，也不会因为缺外观而渲染空白。

## 外观组件约定

1. **自带根元素**：分发器不做任何包裹，模块/条目的根类名、`data-*` 标记、行高字号样式都由外观组件落在自己的根元素上，避免多包一层改变布局。
2. **不自造布局留白以外的东西**：会影响测量的内边距、字号等必须与「预览 + 测量树」两处一致（同一个组件渲染两边天然一致）；纯装饰（绝对定位的色带、边框层、细线）不参与布局。
3. **交互事件靠透传**：分发器发出的 `mouseenter` 等事件会作为原生监听挂到外观组件根元素上，外观组件不得声明同名 `emits`。
4. **几何声明与视觉分离**：圆角、内边距这类既影响外观又要在别处读取的值，由外观组件自己声明（例如条目外观把圆角常量传给共享分片规则），不要再建集中样式表。
