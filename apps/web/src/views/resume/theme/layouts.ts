export const pageLayoutRegistry = [
  {
    id: "singleColumn", // 布局编号
    name: "上下布局", // 布局显示名称
    stretchesColumns: false, // 栏位不延伸到纸张底部
  },
  {
    id: "twoColumn", // 布局编号
    name: "左右布局", // 布局显示名称
    stretchesColumns: true, // 左右栏延伸到纸张底部
  },
  {
    id: "topUserTwoColumn", // 布局编号
    name: "个人信息顶部通栏，其余模块左右布局", // 布局显示名称
    stretchesColumns: true, // 下方左右栏延伸到纸张底部
  },
  {
    id: "topUserSingleColumn", // 布局编号
    name: "个人信息顶部通栏，其余模块单栏布局", // 布局显示名称
    stretchesColumns: false, // 下方单栏不延伸到纸张底部
  },
] as const;

export type PageLayoutTemplateId = (typeof pageLayoutRegistry)[number]["id"];

export const isPageLayoutTemplateId = (value: unknown): value is PageLayoutTemplateId =>
  typeof value === "string" && pageLayoutRegistry.some((layout) => layout.id === value);

/** 按布局编号读取栏位是否铺满纸张高度。 */
export const layoutStretchesColumns = (layoutId: unknown): boolean =>
  pageLayoutRegistry.find((layout) => layout.id === layoutId)?.stretchesColumns === true;
