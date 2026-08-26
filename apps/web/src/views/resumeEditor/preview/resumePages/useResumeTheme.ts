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
  fontSizeList,
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
  const fontSizeIndex = computed(() => {
    // 自定义字号取最近档位，避免未命中预设值时产生异常行高偏移
    return fontSizeList.reduce((closestIndex, item, index) => {
      const closest = fontSizeList[closestIndex];
      return Math.abs(item.value - fontSize.value) < Math.abs(closest.value - fontSize.value)
        ? index
        : closestIndex;
    }, 0);
  });
  const fontValue = computed(() => (offset = 0) => ({
    fontSize: `${fontSize.value + offset}px`,
  }));
  const lineHeightValue = computed(() => (offset = 0) => {
    // 兼容旧版像素行高和连续控件的无单位行高，避免无单位值被当成像素挤叠内容
    if (lineHeight.value <= 10) {
      return { lineHeight: `${Math.max(1, lineHeight.value)}` };
    }
    const indexOffset = (fontSizeIndex.value - 2) * 3;
    return { lineHeight: `${lineHeight.value + offset + indexOffset}px` };
  });
  const themeColor = computed(() => ui.value.color || ui.value.themeColor);
  const themeTemplate = computed(() => ui.value.themeTemplate);

  provide("fontValue", fontValue);
  provide("lineHeightValue", lineHeightValue);
  provide("themeColor", themeColor);
  provide("themeTemplate", themeTemplate);

  return { paddingValue, fontValue, lineHeightValue, themeColor, themeTemplate };
};
