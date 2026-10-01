import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import BannerAppearance from "./themes/banner.vue";
import BannerRibbonAppearance from "./themes/bannerRibbon.vue";
import PlainAppearance from "./themes/plain.vue";
import UserBandAppearance from "./themes/userBand.vue";
import ViewAppearance from "./themes/view.vue";
import ViewFrameAppearance from "./themes/viewFrame.vue";

/** 区域外观注册表：外观编号 → 组件。只做静态映射，保证测量时几何立即就绪。 */
export const regionAppearanceRegistry: Record<string, Component> = {
  plain: PlainAppearance, // 不绘制底色与留白
  view: ViewAppearance, // 默认正文外观：透明底板 + 区域留白
  viewFrame: ViewFrameAppearance, // 白色底板正文外观：白底 + 圆角 + 深色文字
  banner: BannerAppearance, // 顶部标语通栏色带：外扩到页面边缘并保留页面留白
  bannerRibbon: BannerRibbonAppearance, // 顶部标语通栏色带 + 底沿对比色细线
  userBand: UserBandAppearance, // 个人信息通栏底纹：整块铺满页面宽度
};

/** 区域外观别名：历史简历里正文外观还叫 frame，映射到现在的 viewFrame */
const regionAppearanceAliases: Record<string, string> = {
  frame: "viewFrame",
};

/** 各槽位的缺省外观编号：顶部标语绘制通栏色带，个人信息不绘制，main 沿用正文容器外观。 */
export const defaultRegionAppearance: Record<RegionSlotId, string> = {
  slogan: "banner",
  user: "plain",
  main: "view",
};

/** 绘制底板的区域外观编号：正文需要铺满整页时才拉满高度，避免透明外观被无谓拉伸 */
export const regionSurfaceAppearances = new Set<string>(["viewFrame"]);

/** 解析区域实际使用的外观编号：未登记时回退槽位缺省外观，历史编号先经别名转换 */
export const resolveRegionAppearanceId = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
): string => {
  if (!slot) return "plain";
  const configured = regionConfig?.[slot];
  const requested = typeof configured === "string" ? configured : defaultRegionAppearance[slot];
  const appearanceId = regionAppearanceAliases[requested] || requested;
  return regionAppearanceRegistry[appearanceId] ? appearanceId : defaultRegionAppearance[slot];
};

/** 解析区域实际使用的外观组件：未登记的槽位、主题未配置或配置了未知编号都按缺省外观回退。 */
export const resolveRegionAppearance = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[resolveRegionAppearanceId(regionConfig, slot)];
