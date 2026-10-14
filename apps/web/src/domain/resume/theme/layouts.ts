/** 双栏布局保存的左右模块顺序。 */
export interface LayoutColumns {
  left: string[]; // 左栏模块编号与顺序
  right: string[]; // 右栏模块编号与顺序
}

/** 页面布局定义。 */
interface PageLayoutDefinition {
  id: string; // 布局编号
  name: string; // 布局显示名称
  stretchesColumns: boolean; // 栏位是否延伸到纸张底部
  defaultLeftModuleKeys?: readonly string[]; // 双栏默认放入左栏的模块编号
  defaultRightModuleKeys?: readonly string[]; // 双栏默认放入右栏的模块编号（右窄版式使用）
  pinnedModuleKeys?: readonly string[]; // 固定在独立区域、不参与双栏分配的模块编号
}

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
    defaultLeftModuleKeys: ["user", "account", "skill", "advantage"], // 个人信息与简短模块默认进入左栏
  },
  {
    id: "twoColumnRightUser", // 布局编号
    name: "左右布局（右栏窄，个人信息在右）", // 布局显示名称
    stretchesColumns: true, // 左右栏延伸到纸张底部
    defaultRightModuleKeys: ["user", "account", "skill", "advantage"], // 个人信息与简短模块默认进入右窄栏
  },
  {
    id: "topUserTwoColumn", // 布局编号
    name: "个人信息顶部通栏，其余模块左右布局", // 布局显示名称
    stretchesColumns: true, // 下方左右栏延伸到纸张底部
    defaultLeftModuleKeys: ["account", "skill", "advantage"], // 简短模块默认进入左栏
    pinnedModuleKeys: ["user"], // 个人信息固定在顶部通栏
  },
  {
    id: "topUserSingleColumn", // 布局编号
    name: "个人信息顶部通栏，其余模块单栏布局", // 布局显示名称
    stretchesColumns: false, // 下方单栏不延伸到纸张底部
  },
] as const satisfies readonly PageLayoutDefinition[];

export type PageLayoutTemplateId = (typeof pageLayoutRegistry)[number]["id"];

export const isPageLayoutTemplateId = (value: unknown): value is PageLayoutTemplateId =>
  typeof value === "string" && pageLayoutRegistry.some((layout) => layout.id === value);

/** 按布局编号读取栏位是否铺满纸张高度。 */
export const layoutStretchesColumns = (layoutId: unknown): boolean =>
  pageLayoutRegistry.find((layout) => layout.id === layoutId)?.stretchesColumns === true;

/** 按布局编号判断是否使用左右栏模块分配。 */
export const layoutUsesColumns = (layoutId: unknown): layoutId is PageLayoutTemplateId =>
  pageLayoutRegistry.some(
    (layout) =>
      layout.id === layoutId &&
      ("defaultLeftModuleKeys" in layout || "defaultRightModuleKeys" in layout),
  );

/** 按布局定义生成默认左右栏模块顺序。 */
export const createDefaultLayoutColumns = (
  layoutId: PageLayoutTemplateId,
  moduleKeys: string[],
): LayoutColumns => {
  const definition: PageLayoutDefinition | undefined = pageLayoutRegistry.find(
    (layout) => layout.id === layoutId,
  );
  const pinnedModules = new Set<string>(definition?.pinnedModuleKeys ?? []);
  const orderedKeys = [...new Set(moduleKeys)].filter((moduleKey) => !pinnedModules.has(moduleKey));
  // 版式声明默认栏决定这批模块落在左栏还是右栏，未声明的一律进另一栏
  const defaultSide = definition?.defaultRightModuleKeys ? "right" : "left";
  const defaultKeys = new Set<string>(
    (defaultSide === "right"
      ? definition?.defaultRightModuleKeys
      : definition?.defaultLeftModuleKeys) ?? [],
  );
  const isDefaultSide = (moduleKey: string) => defaultKeys.has(moduleKey);
  const defaultSideKeys = orderedKeys.filter(isDefaultSide);
  const otherSideKeys = orderedKeys.filter((moduleKey) => !isDefaultSide(moduleKey));
  return defaultSide === "right"
    ? { left: otherSideKeys, right: defaultSideKeys }
    : { left: defaultSideKeys, right: otherSideKeys };
};

/** 保留已保存的栏内顺序，并按布局定义补齐新增模块、移除不存在的模块。 */
export const resolveLayoutColumns = (
  layoutId: PageLayoutTemplateId,
  moduleKeys: string[],
  columns?: LayoutColumns | null,
): LayoutColumns => {
  const defaults = createDefaultLayoutColumns(layoutId, moduleKeys);
  if (!columns) return defaults;
  const available = new Set(moduleKeys);
  const definition = pageLayoutRegistry.find((layout) => layout.id === layoutId);
  const pinnedModules = new Set<string>(definition?.pinnedModuleKeys ?? []);
  const left = [...new Set(columns.left)].filter(
    (key) => available.has(key) && !pinnedModules.has(key),
  );
  const right = [...new Set(columns.right)].filter(
    (key) => available.has(key) && !pinnedModules.has(key) && !left.includes(key),
  );
  const assigned = new Set([...left, ...right]);
  defaults.left.forEach((key) => {
    if (!assigned.has(key)) left.push(key);
  });
  defaults.right.forEach((key) => {
    if (!assigned.has(key)) right.push(key);
  });
  return { left, right };
};
