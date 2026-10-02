/**
 * 简历页区域槽位：页面从上到下固定的通栏层，是主题外观与页面几何的共同锚点。
 * 槽位编号与区域外观取值同名，是区域外观的解析入口。
 */
export const regionSlotRegistry = [
  {
    id: "slogan", // 槽位编号：顶部标语
    name: "顶部标语", // 槽位显示名称
  },
  {
    id: "user", // 槽位编号：个人信息
    name: "个人信息",
  },
  {
    id: "main", // 槽位编号：正文
    name: "正文",
  },
] as const;

/** 区域槽位编号 */
export type RegionSlotId = (typeof regionSlotRegistry)[number]["id"];

/** 判断外部传入的值是否为合法的区域槽位编号。 */
export const isRegionSlotId = (value: unknown): value is RegionSlotId =>
  typeof value === "string" && regionSlotRegistry.some((slot) => slot.id === value);

/**
 * 解析区域槽位编号。
 * 布局模板直接下发槽位编号（slogan / user / main），未登记的编号由调用方按无外观区域处理。
 */
export const resolveRegionSlot = (regionId: unknown): RegionSlotId | null =>
  isRegionSlotId(regionId) ? regionId : null;
