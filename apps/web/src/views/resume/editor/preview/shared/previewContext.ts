import { inject, provide, type ComputedRef, type InjectionKey } from "vue";
import type { ThemeDecisions } from "@/views/resume/theme/themeDecisions";
import type { ResumeTheme } from "@/views/resume/theme/useResumeTheme";

/** 预览模块共享的运行时上下文，集中管理数据、主题与个人字段配置。 */
export interface ResumePreviewContext {
  data: ComputedRef<Record<string, any>>;
  lang: ComputedRef<string>;
  ui: ComputedRef<Record<string, any>>;
  theme: ResumeTheme;
  /** 当前主题固定版式与纸张外观，独立于用户界面配置。 */
  themeDecisions: ComputedRef<ThemeDecisions>;
  /** 是否展示页码，用于计算图片作品的整页可用高度。 */
  showPageNumber: ComputedRef<boolean>;
  userHiddenFields: ComputedRef<Set<string>>;
  userFieldOrder: ComputedRef<string[]>;
  userFieldLabels: ComputedRef<Map<string, string>>;
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
