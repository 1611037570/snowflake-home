/**
 * useResumeTheme —— 简历主题样式注入
 *
 * 根据 item.ui 计算主题样式（内边距、字号、行高、主题色、风格模板），
 * 通过 provide 提供给模块子组件使用。
 */
import { computed, provide, ref, watch, type ComputedRef, type Ref } from "vue";
import { loadFont } from "@/utils";
import {
  defaultAvatarPosition,
  defaultDateStyle,
  defaultFontSize,
  defaultInfoPosition,
  defaultLineHeight,
  defaultPadding,
  defaultTitleFontSize,
  defaultUserInfoLayout,
  defaultUserInfoMode,
} from "@/stores/modules/resume/uiConfig";

/** 简历主题配置（item.ui） */
type ResumeUi = Record<string, any>;

/** 返回的主题样式值集合 */
export interface ResumeTheme {
  paddingStyle: ComputedRef<Record<string, string>>;
  fontStyle: ComputedRef<Record<string, string>>;
  titleFontStyle: ComputedRef<Record<string, string>>;
  lineHeightStyle: ComputedRef<Record<string, string>>;
  paragraphSpacingStyle: ComputedRef<Record<string, string>>;
  fontReadyVersion: Ref<number>;
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
  const paragraphSpacing = computed(() => Number(ui.value.paragraphSpacing));
  const fontReadyVersion = ref(0);
  let fontRequestId = 0;

  // 字体加载完成后递增版本号，通知分页测量使用已生效的字体重新计算
  watch(
    () => ui.value.fontFamily,
    async (fontKey) => {
      const requestId = ++fontRequestId;
      try {
        await loadFont(fontKey);
      } catch {
        // 加载失败时继续使用浏览器回退字体，并触发一次测量
      }
      if (requestId === fontRequestId) fontReadyVersion.value += 1;
    },
    { immediate: true },
  );

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
  // 模块标题字号：缺失时回退默认值
  const titleFontSize = computed(() => toNumber(ui.value.titleFontSize, defaultTitleFontSize));
  // 模块标题样式：独立字号，不随正文字号变化
  const titleFontStyle = computed(() => ({
    fontSize: `${titleFontSize.value}px`,
  }));
  const lineHeightStyle = computed(() => ({
    lineHeight: `${lineHeight.value}`,
  }));
  // 内部纵向间距统一使用上边距，避免与模块间距混用
  const paragraphSpacingStyle = computed(() => ({
    marginTop: `${paragraphSpacing.value}px`,
  }));

  const fontValue = computed(() => {
    const base = fontStyle.value;
    return (offset = 0) => (offset === 0 ? base : { fontSize: `${fontSize.value + offset}px` });
  });
  // 行高使用无单位倍数，随各字段字号自动缩放
  const lineHeightValue = computed(() => {
    const base = lineHeightStyle.value;
    return () => base;
  });
  // 主题色统一读取 ui 的 themeColor
  const themeColor = computed(() => ui.value.themeColor);
  const themeTemplate = computed(() => ui.value.themeTemplate);

  // 个人信息展示模式（图标/文字/隐藏），缺失时回退默认值
  const userInfoMode = computed(() => ui.value.userInfoMode ?? defaultUserInfoMode);
  // 个人信息布局（网格/弹性），缺失时回退默认值
  const userInfoLayout = computed(() => ui.value.userInfoLayout ?? defaultUserInfoLayout);
  // 头像位置（左/居中/右），缺失时回退默认值
  const avatarPosition = computed(() => ui.value.avatarPosition ?? defaultAvatarPosition);
  // 信息位置（左/居中/右），独立于头像位置，缺失时回退默认值
  const infoPosition = computed(() => ui.value.infoPosition ?? defaultInfoPosition);
  // 日期样式（2026.9 / 2026年9月），缺失时回退默认值
  const dateStyle = computed(() => ui.value.dateStyle ?? defaultDateStyle);

  provide("fontValue", fontValue);
  provide("titleFontStyle", titleFontStyle);
  provide("lineHeightValue", lineHeightValue);
  provide("paragraphSpacingStyle", paragraphSpacingStyle);
  provide("themeColor", themeColor);
  provide("themeTemplate", themeTemplate);
  provide("userInfoMode", userInfoMode);
  provide("userInfoLayout", userInfoLayout);
  provide("avatarPosition", avatarPosition);
  provide("infoPosition", infoPosition);
  provide("dateStyle", dateStyle);

  return {
    paddingStyle,
    fontStyle,
    titleFontStyle,
    lineHeightStyle,
    paragraphSpacingStyle,
    fontReadyVersion,
    fontValue,
    lineHeightValue,
    themeColor,
    themeTemplate,
  };
};
