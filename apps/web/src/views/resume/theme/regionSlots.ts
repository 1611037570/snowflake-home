/**
 * 简历页区域槽位：页面从上到下固定的通栏层，是主题外观与页面几何的共同锚点。
 * 槽位编号一经发布不再变更，历史简历数据依赖它解析外观。
 */
export const regionSlotRegistry = [
  {
    id: "slogan", // 槽位编号：顶部标语
    name: "顶部标语", // 槽位显示名称
    firstPageOnly: true, // 只出现在首页，不参与分页装箱
  },
  {
    id: "user", // 槽位编号：个人信息
    name: "个人信息",
    firstPageOnly: true, // 只出现在首页，不参与分页装箱
  },
  {
    id: "main", // 槽位编号：正文
    name: "正文",
    firstPageOnly: false, // 跨页区域，接管首页剩余高度并参与分页装箱
  },
] as const;

/** 区域槽位编号 */
export type RegionSlotId = (typeof regionSlotRegistry)[number]["id"];

/** 判断外部传入的值是否为合法的区域槽位编号。 */
export const isRegionSlotId = (value: unknown): value is RegionSlotId =>
  typeof value === "string" && regionSlotRegistry.some((slot) => slot.id === value);

/**
 * 引擎区域编号到槽位的映射：当前布局模板用 header 承载个人信息、main 承载正文。
 * 引擎改为直接下发槽位编号后，这张表会退化成恒等映射并被删除。
 */
export const regionSlotByRegionId: Record<string, RegionSlotId> = {
  header: "user", // 顶部通栏区域承载个人信息
  main: "main", // 正文区域
};

/** 解析引擎区域编号对应的槽位，未登记的编号返回空，由调用方按未登记区域处理。 */
export const resolveRegionSlot = (regionId: unknown): RegionSlotId | null =>
  typeof regionId === "string" ? regionSlotByRegionId[regionId] || null : null;
