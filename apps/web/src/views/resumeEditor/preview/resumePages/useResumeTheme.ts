/**
 * useResumeTheme —— 简历主题样式注入
 *
 * 根据 item.ui 计算主题样式（内边距、字号、行高、主题色、风格模板），
 * 通过 provide 提供给模块子组件使用。
 */
import { computed, provide, type ComputedRef } from "vue";
import { fontSizeList } from "@/stores/modules/resume/uiConfig";

/** 简历主题配置（item.ui） */
type ResumeUi = Record<string, any>;

/** 返回的主题样式值集合 */
export interface ResumeTheme {
  paddingValue: ComputedRef<(offset?: number) => Record<string, string>>;
  fontValue: ComputedRef<(offset?: number) => Record<string, string>>;
  lineHeightValue: ComputedRef<(offset?: number) => Record<string, string>>;
  themeColor: ComputedRef<string | undefined>;
  themeTemplate: ComputedRef<any>;
}

/**
 * 注入简历主题样式
 * @param ui - item.ui 的响应式引用
 */
export const useResumeTheme = (ui: ComputedRef<ResumeUi>): ResumeTheme => {
  // 页面始终不保留下边距，底部空间由页码区域控制
  const paddingValue = computed(() => (offset = 0) => {
    const padding = ui.value.padding + offset;
    return {
      paddingTop: `${padding}px`,
      paddingLeft: `${padding}px`,
      paddingRight: `${padding}px`,
    };
  });
  const fontSize = computed(() => ui.value.fontSize);
  const fontSizeIndex = computed(() => {
    return fontSizeList.findIndex((item) => item.value === fontSize.value);
  });
  const fontValue = computed(() => (offset = 0) => ({
    fontSize: `${ui.value.fontSize + offset}px`,
  }));
  const lineHeightValue = computed(() => (offset = 0) => {
    const indexOffset = (fontSizeIndex.value - 2) * 3;
    return { lineHeight: `${ui.value.lineHeight + offset + indexOffset}px` };
  });
  const themeColor = computed(() => ui.value.color || ui.value.themeColor);
  const themeTemplate = computed(() => ui.value.themeTemplate);

  provide("paddingValue", paddingValue);
  provide("fontValue", fontValue);
  provide("lineHeightValue", lineHeightValue);
  provide("themeColor", themeColor);
  provide("themeTemplate", themeTemplate);

  return { paddingValue, fontValue, lineHeightValue, themeColor, themeTemplate };
};
