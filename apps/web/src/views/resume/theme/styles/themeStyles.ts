/**
 * 正文区域留白的旧主题回退值。
 *
 * 正文容器的视觉已经搬到 `regions/themes/view*.vue`，这里只保留历史留白数字：
 * 升级前留白写在样式表里，老简历的 ui 里没有 `ui.region.main.padding` 声明，
 * 引擎与外观两侧都要按正文外观编号取到同一个历史值，否则内边距会与分页扣除值不一致。
 * 新简历由主题显式声明区域留白，不再走这张表。
 */
const legacyMainRegionPadding: Record<string, number> = {
  view: 0, // 默认正文外观：不占内边距
  viewFrame: 12, // 白色底板外观：内容向底板内侧收进
  frame: 12, // 旧主题编号：正文外观还叫 frame 时期的历史简历
};

/** 按正文外观编号取历史留白，未知编号按 0 处理 */
export const getLegacyMainRegionPadding = (id: string) => legacyMainRegionPadding[id] ?? 0;
