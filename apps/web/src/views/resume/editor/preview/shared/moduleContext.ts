import type { ComputedRef, InjectionKey } from "vue";

/** 主题下层读取公共模块身份，避免依赖父组件类名和内部结构。 */
export const resumeModuleKey: InjectionKey<ComputedRef<string>> = Symbol("resumeModuleKey");
