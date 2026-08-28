/**
 * useResumeTheme —— 简历主题样式注入
 *
 * 根据 item.ui 计算主题样式（内边距、字号、行高、主题色、风格模板），
 * 通过 provide 提供给模块子组件使用。
 */
import { computed, provide, type ComputedRef } from "vue";
import {
  defaultFontSize,
  defaultLineHeight,
  defaultPadding,
} from "@/stores/modules/resume/uiConfig";

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
  const toNumber = (value: unknown, fallback: number) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const padding = computed(() => toNumber(ui.value.padding, defaultPadding));
  const fontSize = computed(() => toNumber(ui.value.fontSize, defaultFontSize));
  const lineHeight = computed(() => toNumber(ui.value.lineHeight, defaultLineHeight));

  // 页面始终不保留下边距，底部空间由页码区域控制
  const paddingValue = computed(() => (offset = 0) => {
    const value = padding.value + offset;
    return {
      paddingTop: `${value}px`,
      paddingLeft: `${value}px`,
      paddingRight: `${value}px`,
    };
  });
  const fontValue = computed(() => (offset = 0) => ({
    fontSize: `${fontSize.value + offset}px`,
  }));
  // 行高统一使用像素值
  const lineHeightValue = computed(() => (offset = 0) => ({
    lineHeight: `${lineHeight.value + offset}px`,
  }));
  const themeColor = computed(() => ui.value.color || ui.value.themeColor);
  const themeTemplate = computed(() => ui.value.themeTemplate);

  provide("fontValue", fontValue);
  provide("lineHeightValue", lineHeightValue);
  provide("themeColor", themeColor);
  provide("themeTemplate", themeTemplate);

  return { paddingValue, fontValue, lineHeightValue, themeColor, themeTemplate };
};
