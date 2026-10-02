import {
  defaultPageRadius,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
} from "@/stores/modules/resume/config/uiConfig";
import { resolveRegionPadding } from "@/views/resume/theme/regionPadding";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";

/** 通栏色带样式：只描述外扩与留白，颜色由外观组件自行补充 */
export interface BandStyle {
  /** 覆盖区域容器下发的整宽样式，负外边距才能把色带撑到页面边缘 */
  width: string;
  /** 相对页面留白的外扩量，单位为像素 */
  marginTop: string;
  marginLeft: string;
  marginRight: string;
  /** 色带内部留白：页面留白加区域留白 */
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  /** 贴页面顶边时与纸张圆角一致的顶部圆角 */
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
}

/**
 * 解析通栏色带样式。
 * 页面留白用等量负外边距外扩、等量内边距收回，内容盒宽度不变；
 * 区域留白只作为内边距，与引擎扣除的那份声明同源，因此色带能铺满页面而分页口径不变。
 * 所有通栏色带外观都必须走这个函数，避免各自算一份留白导致渲染与分页错位。
 * @param ui 简历主题配置
 * @param slot 区域槽位
 * @param options roundTop 为真时按纸张圆角给出顶部圆角（色带贴页面顶边时使用）
 */
export const resolveBandStyle = (
  ui: Record<string, any> | undefined,
  slot: RegionSlotId,
  options: { roundTop?: boolean } = {},
): BandStyle => {
  const paddingHorizontal = Number(ui?.page?.padding?.horizontal) || defaultPaddingHorizontal;
  const paddingVertical = Number(ui?.page?.padding?.vertical) || defaultPaddingVertical;
  const regionPadding = resolveRegionPadding(ui, slot);
  const pageRadius = Math.max(0, Number(ui?.page?.radius ?? defaultPageRadius));
  const style: BandStyle = {
    width: "auto",
    marginTop: `-${paddingVertical}px`,
    marginLeft: `-${paddingHorizontal}px`,
    marginRight: `-${paddingHorizontal}px`,
    paddingTop: `${paddingVertical + regionPadding.top}px`,
    paddingBottom: `${regionPadding.bottom}px`,
    paddingLeft: `${paddingHorizontal + regionPadding.left}px`,
    paddingRight: `${paddingHorizontal + regionPadding.right}px`,
  };
  if (options.roundTop) {
    style.borderTopLeftRadius = `${pageRadius}px`;
    style.borderTopRightRadius = `${pageRadius}px`;
  }
  return style;
};
