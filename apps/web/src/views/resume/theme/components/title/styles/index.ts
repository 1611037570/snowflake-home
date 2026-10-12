// 组件按文件名登记，编号即文件名，未匹配时回退兜底标题样式。
export const titleStyleComponentLoaders = import.meta.glob("./*.vue");

// 标题样式清单与解析入口统一由 domain 层维护，视图层只补充组件加载器。
export {
  defaultTitleStyleId,
  resolveTitleStyleDefinition,
  resolveTitleStyleId,
  titleStyleList,
  titleStyleRegistry,
} from "@/domain/resume/theme/titleStyles";
export type { TitleStyleDefinition, TitleStyleId } from "@/domain/resume/theme/titleStyles";
