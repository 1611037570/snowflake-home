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
  defaultDatePosition,
  defaultDateStyle,
  defaultFontSize,
  defaultInfoPosition,
  defaultInfoSeparator,
  defaultLinkUnderline,
  defaultLineHeight,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultThemeColor,
  defaultTextAlign,
  defaultTitleFontSize,
  defaultTitleIcon,
  defaultUserInfoLayout,
  defaultUserInfoMode,
} from "@/stores/modules/resume/uiConfig";

/** 简历主题配置（item.ui） */
type ResumeUi = Record<string, any>;

/** 颜色亮度是否偏亮：决定主题色块上的文字取深色还是白色 */
const isLightColor = (color: string) => {
  const hex = String(color ?? "").replace("#", "");
  if (hex.length < 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
};

/** 返回的主题样式值集合 */
export interface ResumeTheme {
  paddingStyle: ComputedRef<Record<string, string>>;
  fontStyle: ComputedRef<Record<string, string>>;
  titleFontStyle: ComputedRef<Record<string, string>>;
  lineHeightStyle: ComputedRef<Record<string, string>>;
  paragraphSpacingStyle: ComputedRef<Record<string, string>>;
  innerSpacingStyle: ComputedRef<Record<string, string>>;
  fontReadyVersion: Ref<number>;
  fontValue: ComputedRef<(offset?: number) => Record<string, string>>;
  lineHeightValue: ComputedRef<() => Record<string, string>>;
  themeColor: ComputedRef<string | undefined>;
  themeColorSoft: ComputedRef<string>;
  themeColorLine: ComputedRef<string>;
  themeColorContrast: ComputedRef<string>;
  themeTemplate: ComputedRef<any>;
  userInfoMode: ComputedRef<string>;
  userInfoLayout: ComputedRef<string>;
  avatarPosition: ComputedRef<string>;
  infoPosition: ComputedRef<string>;
  dateStyle: ComputedRef<string>;
  datePosition: ComputedRef<string>;
  textAlign: ComputedRef<string>;
  titleIconEnabled: ComputedRef<boolean>;
  linkUnderline: ComputedRef<boolean>;
  infoSeparator: ComputedRef<string>;
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
  const paddingVertical = computed(() =>
    toNumber(ui.value.paddingVertical, defaultPaddingVertical),
  );
  const paddingHorizontal = computed(() =>
    toNumber(ui.value.paddingHorizontal, defaultPaddingHorizontal),
  );
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
  // 上下边距对称：顶部与底部各留一份，页尾落在底部留白之内
  const paddingStyle = computed(() => ({
    paddingTop: `${paddingVertical.value}px`,
    paddingBottom: `${paddingVertical.value}px`,
    paddingLeft: `${paddingHorizontal.value}px`,
    paddingRight: `${paddingHorizontal.value}px`,
  }));
  const fontStyle = computed(() => ({
    fontSize: `${fontSize.value}px`,
  }));
  // 模块标题字号：缺失时回退默认值
  const titleFontSize = computed(() => toNumber(ui.value.titleFontSize, defaultTitleFontSize));
  // 模块标题样式：独立字号，并在配置值基础上增加 1px
  const titleFontStyle = computed(() => ({
    fontSize: `${titleFontSize.value + 1}px`,
  }));
  const lineHeightStyle = computed(() => ({
    lineHeight: `${lineHeight.value}`,
  }));
  // 内部纵向间距统一使用上边距，避免与模块间距混用
  const paragraphSpacingStyle = computed(() => ({
    marginTop: `${paragraphSpacing.value}px`,
  }));
  // 条目内部纵向间距固定为 4px，与模块段落间距分开控制
  const innerSpacingStyle = computed(() => ({
    marginTop: "4px",
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
  // 主题色统一读取 ui 的 themeColor，缺失时回退默认值
  const themeColor = computed(() => ui.value.themeColor ?? defaultThemeColor);
  // 主题色派生色：统一由主题色推导，避免各风格主题各自拼接透明度导致难以管理
  // 浅底色：色块底托，主题色 10% 透明度
  const themeColorSoft = computed(() => `${themeColor.value}1a`);
  // 线条色：分隔线、描边，主题色 40% 透明度
  const themeColorLine = computed(() => `${themeColor.value}66`);
  // 对比文字色：主题色块上的文字按亮度自动取深色或白色
  const themeColorContrast = computed(() =>
    isLightColor(themeColor.value) ? "#1f2937" : "#ffffff",
  );
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
  // 日期位置（左/右），缺失时回退默认值
  const datePosition = computed(() => ui.value.datePosition ?? defaultDatePosition);
  // 文本对齐（系统/两端），缺失时回退默认值
  const textAlign = computed(() => ui.value.textAlign ?? defaultTextAlign);
  // 标题图标开关，缺失时回退默认值
  const titleIconEnabled = computed(() => ui.value.titleIcon ?? defaultTitleIcon);
  // 链接下划线开关，缺失时回退默认值
  const linkUnderline = computed(() => ui.value.linkUnderline ?? defaultLinkUnderline);
  // 并列信息分隔符，缺失时保留默认留白样式。
  const infoSeparator = computed(() => ui.value.infoSeparator ?? defaultInfoSeparator);

  provide("fontValue", fontValue);
  provide("titleFontStyle", titleFontStyle);
  provide("lineHeightValue", lineHeightValue);
  provide("paragraphSpacingStyle", paragraphSpacingStyle);
  provide("innerSpacingStyle", innerSpacingStyle);
  provide("themeColor", themeColor);
  provide("themeColorSoft", themeColorSoft);
  provide("themeColorLine", themeColorLine);
  provide("themeColorContrast", themeColorContrast);
  provide("themeTemplate", themeTemplate);
  provide("userInfoMode", userInfoMode);
  provide("userInfoLayout", userInfoLayout);
  provide("avatarPosition", avatarPosition);
  provide("infoPosition", infoPosition);
  provide("dateStyle", dateStyle);
  provide("datePosition", datePosition);
  provide("textAlign", textAlign);
  provide("titleIconEnabled", titleIconEnabled);
  provide("linkUnderline", linkUnderline);
  provide("infoSeparator", infoSeparator);

  return {
    paddingStyle,
    fontStyle,
    titleFontStyle,
    lineHeightStyle,
    paragraphSpacingStyle,
    innerSpacingStyle,
    fontReadyVersion,
    fontValue,
    lineHeightValue,
    themeColor,
    themeColorSoft,
    themeColorLine,
    themeColorContrast,
    themeTemplate,
    userInfoMode,
    userInfoLayout,
    avatarPosition,
    infoPosition,
    dateStyle,
    datePosition,
    textAlign,
    titleIconEnabled,
    linkUnderline,
    infoSeparator,
  };
};
