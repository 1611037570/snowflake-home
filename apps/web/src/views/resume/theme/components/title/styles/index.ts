// 组件按文件名登记，编号即文件名，未匹配时回退兜底标题样式。
import { defineAsyncComponent, type Component } from "vue";

export const titleStyleComponentLoaders = import.meta.glob("./*.vue");

// 异步包装对同一 loader 幂等，表在模块级只构建一次，避免每个标题实例重复建 60+ 项。
export const titleStyleComponents: Record<string, Component> = Object.fromEntries(
  Object.entries(titleStyleComponentLoaders).map(([path, loader]) => [
    path.slice("./".length, -".vue".length),
    defineAsyncComponent(loader),
  ]),
);

// 标题样式清单与解析入口统一由 domain 层维护，视图层只补充组件加载器。
export {
  defaultTitleStyleId,
  resolveTitleStyleDefinition,
  resolveTitleStyleId,
  titleStyleList,
  titleStyleRegistry,
} from "@/domain/resume/theme/titleStyles";
export type { TitleStyleDefinition, TitleStyleId } from "@/domain/resume/theme/titleStyles";
