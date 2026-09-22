import type {
  BoxSpacing,
  PageLayoutConfig,
  PageSize,
} from "../pageLayoutTypes";

/** 创建单栏布局所需的参数 */
export interface CreateSingleColumnLayoutOptions {
  /** 按模板顺序明确指定进入单栏的模块 key */
  moduleKeys: string[];
  /** 页面尺寸 */
  pageSize: PageSize;
  /** 页面四周的内边距 */
  pagePadding: BoxSpacing;
  /** 单栏内节点之间的间距 */
  gap: number;
  /** 页面区域之间的垂直间距 */
  regionGap: number;
  /** 单栏布局保留的栏间距字段，固定为零即可。 */
  columnGap?: number;
  /** 区域编号，缺省使用正文区域 */
  regionId?: string;
  /** 栏编号，缺省使用正文栏 */
  columnId?: string;
}

/**
 * 创建只有一个区域、一个栏位的布局配置。
 * 模块顺序由调用方明确传入，不负责自动分配或补全遗漏模块。
 */
export const createSingleColumnLayout = ({
  moduleKeys,
  pageSize,
  pagePadding,
  gap,
  regionGap,
  columnGap = 0,
  regionId = "main",
  columnId = "main-column",
}: CreateSingleColumnLayoutOptions): PageLayoutConfig => ({
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
          id: columnId,
          width: { mode: "ratio", value: 1 },
          gap,
          moduleKeys: [...moduleKeys],
        },
      ],
    },
  ],
});
