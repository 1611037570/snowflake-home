import type { BoxSpacing, PageLayoutConfig, PageSize } from "../pageLayoutTypes";

/** 双栏固定布局所需的参数。 */
export interface CreateTwoColumnLayoutOptions {
  /** 页面尺寸。 */
  pageSize: PageSize;
  /** 页面四周内边距。 */
  pagePadding: BoxSpacing;
  /** 左栏明确指定的模块 key，顺序就是左栏内的排版顺序。 */
  leftModuleKeys: string[];
  /** 右栏明确指定的模块 key，顺序就是右栏内的排版顺序。 */
  rightModuleKeys: string[];
  /** 左右栏之间的水平间距。 */
  columnGap: number;
  /** 栏内节点之间的垂直间距。 */
  gap: number;
  /** 区域之间的垂直间距。 */
  regionGap: number;
  /** 区域编号。 */
  regionId?: string;
}

/**
 * 创建明确分配模块的双栏布局。
 * 该函数不会在左右栏之间重新分配、均衡或补齐任何模块。
 */
export const createTwoColumnLayout = ({
  pageSize,
  pagePadding,
  leftModuleKeys,
  rightModuleKeys,
  columnGap,
  gap,
  regionGap,
  regionId = "main",
}: CreateTwoColumnLayoutOptions): PageLayoutConfig => ({
  pageSize,
  pagePadding,
  regionGap,
  columnGap,
  regions: [
    {
      id: regionId,
      order: 0,
      height: { mode: "remaining" },
      columns: [
        {
          id: "left",
          width: { mode: "ratio", value: 1 },
          gap,
          moduleKeys: [...leftModuleKeys],
        },
        {
          id: "right",
          width: { mode: "ratio", value: 1 },
          gap,
          moduleKeys: [...rightModuleKeys],
        },
      ],
    },
  ],
});
