/** 页面尺寸，单位为像素 */
export interface PageSize {
  /** 页面宽度 */
  width: number;
  /** 页面高度 */
  height: number;
}

/** 四个方向的内边距，单位为像素 */
export interface BoxSpacing {
  /** 上内边距 */
  top: number;
  /** 右内边距 */
  right: number;
  /** 下内边距 */
  bottom: number;
  /** 左内边距 */
  left: number;
}

/** 页面区域高度的计算方式 */
export type RegionHeight =
  | { mode: "auto" }
  | { mode: "remaining" }
  | { mode: "fixed"; value: number };

/** 页面栏宽度的计算方式 */
export type ColumnWidth =
  | { mode: "fixed"; value: number }
  | { mode: "ratio"; value: number };

/** 页面布局配置，描述内容应该如何安排到页面区域和栏位中 */
export interface PageLayoutConfig {
  /** 页面尺寸 */
  pageSize: PageSize;
  /** 页面四周的内边距 */
  pagePadding: BoxSpacing;
  /** 页面区域之间的垂直间距 */
  regionGap: number;
  /** 页面同一区域中各栏之间的水平间距 */
  columnGap: number;
  /** 页面区域配置 */
  regions: RegionConfig[];
}

/** 页面中的一个垂直区域，例如页眉区域或正文区域 */
export interface RegionConfig {
  /** 区域唯一编号 */
  id: string;
  /** 区域在页面中的垂直顺序 */
  order: number;
  /** 区域高度的计算方式 */
  height: RegionHeight;
  /** 区域中的栏配置 */
  columns: ColumnConfig[];
}

/** 区域中的一个内容栏 */
export interface ColumnConfig {
  /** 栏唯一编号 */
  id: string;
  /** 栏宽度的计算方式 */
  width: ColumnWidth;
  /** 当前栏内节点之间的间距 */
  gap: number;
  /** 明确指定进入当前栏的模块 key，不允许自动分配 */
  moduleKeys: string[];
}
