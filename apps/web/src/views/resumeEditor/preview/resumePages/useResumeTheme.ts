/**
 * useResumeTheme —— 简历主题样式注入
 *
 * 根据 item.ui 计算主题样式（内边距、字号、行高、主题色、风格模板），
 * 通过 provide 提供给模块子组件使用。
 */
import { computed, provide, type ComputedRef } from "vue";
import {
  defaultAvatarPosition,
  defaultFontSize,
  defaultLineHeight,
  defaultPadding,
  defaultUserInfoMode,
} from "@/stores/modules/resume/uiConfig";

/** 简历主题配置（item.ui） */
type ResumeUi = Record<string, any>;

/** 返回的主题样式值集合 */
export interface ResumeTheme {
  paddingStyle: ComputedRef<Record<string, string>>;
  fontStyle: ComputedRef<Record<string, string>>;
  lineHeightStyle: ComputedRef<Record<string, string>>;
  paddingValue: ComputedRef<(offset?: number) => Record<string, string>>;
  fontValue: ComputedRef<(offset?: number) => Record<string, string>>;
  lineHeightValue: ComputedRef<() => Record<string, string>>;
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

  // 页面级基础样式对象固定复用，避免模板每次渲染都重新创建相同样式
  const paddingStyle = computed(() => {
    const value = padding.value;
    return {
      paddingTop: `${value}px`,
      paddingLeft: `${value}px`,
      paddingRight: `${value}px`,
    };
  });
  const fontStyle = computed(() => ({
    fontSize: `${fontSize.value}px`,
  }));
  const lineHeightStyle = computed(() => ({
    lineHeight: `${lineHeight.value}`,
  }));

  // 页面始终不保留下边距，底部空间由页码区域控制
  const paddingValue = computed(() => {
    const base = paddingStyle.value;
    return (offset = 0) =>
      offset === 0
        ? base
        : {
            paddingTop: `${padding.value + offset}px`,
            paddingLeft: `${padding.value + offset}px`,
            paddingRight: `${padding.value + offset}px`,
          };
  });
  const fontValue = computed(() => {
    const base = fontStyle.value;
    return (offset = 0) => (offset === 0 ? base : { fontSize: `${fontSize.value + offset}px` });
  });
  // 行高使用无单位倍数，随各字段字号自动缩放
  const lineHeightValue = computed(() => {
    const base = lineHeightStyle.value;
    return () => base;
  });
  const themeColor = computed(() => ui.value.color || ui.value.themeColor);
  const themeTemplate = computed(() => ui.value.themeTemplate);

  // 用户信息展示模式（图标/文字），缺失时回退默认值
  const userInfoMode = computed(() => ui.value.userInfoMode ?? defaultUserInfoMode);
  // 头像位置（左/居中/右），缺失时回退默认值
  const avatarPosition = computed(() => ui.value.avatarPosition ?? defaultAvatarPosition);

  provide("fontValue", fontValue);
  provide("lineHeightValue", lineHeightValue);
  provide("themeColor", themeColor);
  provide("themeTemplate", themeTemplate);
  provide("userInfoMode", userInfoMode);
  provide("avatarPosition", avatarPosition);

  return {
    paddingStyle,
    fontStyle,
    lineHeightStyle,
    paddingValue,
    fontValue,
    lineHeightValue,
    themeColor,
    themeTemplate,
  };
};
