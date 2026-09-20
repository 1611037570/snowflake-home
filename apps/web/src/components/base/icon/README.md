# SfIcon 使用说明

## 基础用法

```vue
<SfIcon icon="iconamoon:settings-fill" size="8" />
```

`icon` 使用 Iconify 图标名称，`size` 和 `boxSize` 使用项目统一尺寸单位。

## 本地图标机制

`SfIcon` 会按以下顺序查找图标：

1. 父级通过 `SF_ICON_LIST_KEY` 注入的本地图标。
2. `localIcons.ts` 中维护的基础组件本地图标。
3. `@iconify/vue` 在线图标。

基础组件自身使用的图标统一维护在 [localIcons.ts](./localIcons.ts) 中。新增基础组件图标时，需要安装对应图标包，并直接导入组件：

```ts
import RiMoonClearFillIcon from "@iconify-vue/ri/moon-clear-fill";

export const LOCAL_ICON_LIST: Record<string, Component> = {
  "ri:moon-clear-fill": RiMoonClearFillIcon,
};
```

不要给 `SfIcon` 传递 `list` 属性。业务域有一组专属图标时，在父级使用 `provide` 注入：

```ts
import { SF_ICON_LIST_KEY } from "@/components/base/icon";
import { PROJECT_ICON_LIST } from "./icons";

provide(SF_ICON_LIST_KEY, PROJECT_ICON_LIST);
```

父级注入的图标只负责覆盖或补充基础图标，不需要重复登记 `localIcons.ts` 中已有的图标。

## 图标选择器数据

图标选项使用 `key` 和 `icon` 分离的数据结构：

```ts
{ key: "contact-phone", icon: "mdi:phone", name: "电话" }
```

用户数据只保存稳定的 `key`，预览时再解析当前的 `icon`。后续替换图标时只修改 `icon`，不要修改 `key`。`name` 只用于展示，不作为用户数据绑定值；`key` 不使用中文或列表序号，避免改名、国际化和排序导致绑定失效。

## 回退规则

- 本地表中存在图标时，直接渲染本地组件，不发起在线图标加载。
- 本地表中不存在图标时，回退到 `@iconify/vue`。
- 使用在线回退时，图标需要先在 `ICON_LIST` 中登记，否则会触发 `fail` 事件。
