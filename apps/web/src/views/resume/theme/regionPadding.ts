import { isRegionSlotId, type RegionSlotId } from "@/views/resume/theme/regionSlots";
import { resolveRegionAppearance } from "@/views/resume/theme/components/regionContainer/registry";

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

const emptyRegionPadding: RegionPadding = {
  top: 0, // 无额外上留白
  right: 0, // 无额外右留白
  bottom: 0, // 无额外下留白
  left: 0, // 无额外左留白
};

/** 统一读取区域组件声明的留白能力。 */
const resolveAppearancePadding = (
  ui: Record<string, any> | undefined,
  slot: RegionSlotId,
): RegionPadding => {
  const appearance = resolveRegionAppearance(ui?.theme?.template, slot);
  return typeof appearance.regionPadding === "function"
    ? appearance.regionPadding(ui)
    : appearance.regionPadding || emptyRegionPadding;
};

/** 取槽位默认组件的留白。 */
export const getDefaultRegionPadding = (slot: RegionSlotId): RegionPadding =>
  resolveAppearancePadding(undefined, slot);

/**
 * 按主题编号读取所选区域组件自身声明的留白。
 * 引擎据此扣除栏宽与可用高度，组件据此绘制内边距。
 */
export const resolveRegionPadding = (
  ui: Record<string, any> | undefined,
  slot: RegionSlotId | string,
): RegionPadding =>
  resolveAppearancePadding(ui, isRegionSlotId(slot) ? slot : "user");
