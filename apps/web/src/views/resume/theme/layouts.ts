export const pageLayoutRegistry = [
  {
    id: "singleColumn", // 布局编号
    name: "上下布局", // 布局显示名称
  },
  {
    id: "twoColumn", // 布局编号
    name: "左右布局", // 布局显示名称
  },
  {
    id: "topUserTwoColumn", // 布局编号
    name: "个人信息顶部通栏，其余模块左右布局", // 布局显示名称
  },
] as const;

export type PageLayoutTemplateId = (typeof pageLayoutRegistry)[number]["id"];

export const isPageLayoutTemplateId = (value: unknown): value is PageLayoutTemplateId =>
  typeof value === "string" && pageLayoutRegistry.some((layout) => layout.id === value);
