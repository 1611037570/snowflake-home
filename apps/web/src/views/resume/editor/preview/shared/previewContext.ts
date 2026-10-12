import { inject, provide, type ComputedRef, type InjectionKey } from "vue";
import type { ThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import type { ResumeTheme } from "@/views/resume/theme/useResumeTheme";
import type { PageLayoutConfig } from "../resumePages/engine/pageLayoutTypes";

import type { ResumeUi } from "@/domain/resume/theme/uiTypes";

/** 预览模块共享的运行时上下文，集中管理数据、主题与个人字段配置。 */
export interface ResumePreviewContext {
  data: ComputedRef<Record<string, any>>; // 当前简历业务数据
  bodyModuleKeys: ComputedRef<string[]>; // 当前可见正文模块的排列顺序
  lang: ComputedRef<string>; // 简历内容展示语言
  ui: ComputedRef<ResumeUi>; // 当前用户可编辑参数
  theme: ResumeTheme; // 响应式配色与排版样式
  layout: ComputedRef<PageLayoutConfig>; // 公共引擎结算的区域与栏几何，主题只能读取
  /** 当前主题固定版式与纸张外观，独立于用户界面配置。 */
  themeDecisions: ComputedRef<ThemeDecisions>;
  /** 是否展示页码，用于计算图片作品的整页可用高度。 */
  showPageNumber: ComputedRef<boolean>;
  userHiddenFields: ComputedRef<Set<string>>; // 个人信息隐藏字段
  userFieldOrder: ComputedRef<string[]>; // 个人信息字段顺序
  userFieldLabels: ComputedRef<Map<string, string>>; // 个人信息字段显示名称
}

const resumePreviewContextKey: InjectionKey<ResumePreviewContext> = Symbol("resumePreviewContext");

/** 提供当前预览实例的共享上下文。 */
export const provideResumePreviewContext = (context: ResumePreviewContext) => {
  provide(resumePreviewContextKey, context);
};

/** 获取当前预览实例的共享上下文。 */
export const useResumePreviewContext = () => {
  const context = inject(resumePreviewContextKey);
  if (!context) throw new Error("Resume preview context is unavailable");
  return context;
};
