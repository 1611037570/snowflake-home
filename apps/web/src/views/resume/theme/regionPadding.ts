import { isRegionSlotId, type RegionSlotId } from "@/views/resume/theme/regionSlots";
import { resolveRegionAppearancePadding } from "@/views/resume/theme/components/regionContainer/registry";

/** 区域四周留白，单位为像素 */
export interface RegionPadding {
  /** 上留白 */
  top: number;
  /** 右留白 */
  right: number;
  /** 下留白 */
  bottom: number;
  /** 左留白 */
  left: number;
}

/** 取槽位默认组件的留白。 */
export const getDefaultRegionPadding = (slot: RegionSlotId): RegionPadding =>
  resolveRegionAppearancePadding(undefined, slot);

/**
 * 按主题编号读取所选区域组件自身声明的留白。
 * 引擎据此扣除栏宽与可用高度，组件据此绘制内边距。
 */
export const resolveRegionPadding = (
  ui: Record<string, any> | undefined,
  slot: RegionSlotId | string,
): RegionPadding =>
  resolveRegionAppearancePadding(ui?.theme?.template, isRegionSlotId(slot) ? slot : "user");
