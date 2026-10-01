export interface ThemeItemStyle {
  background: string;
  borderColor: string;
  radius: string;
  padding: number;
  /** 条目左侧独立留白，单位为像素 */
  paddingLeft?: number;
}

export interface ThemeViewStyle {
  /** 正文容器背景色。 */
  background: string;
  /** 正文容器内边距，单位为像素。 */
  padding: number;
  /** 正文容器圆角，单位为像素。 */
  radius: number;
  /** 正文容器文字颜色。 */
  color: string;
}

const moduleStyles: Record<
  string,
  {
    /** 模块外框装饰类型 */
    frame: "default" | "outline" | "leftLine";
  }
> = {
  default: { frame: "default" },
  outline: { frame: "outline" },
  angledLine: { frame: "leftLine" /* 模块左侧贯穿细线 */ },
};

const itemStyles: Record<string, ThemeItemStyle> = {
  angledLine: {
    /** 条目背景保持透明 */
    background: "transparent",
    /** 条目不绘制边框 */
    borderColor: "transparent",
    /** 条目保持直角 */
    radius: "0",
    /** 条目内容向模块竖线内侧留白 */
    padding: 12,
    /** 左侧留白独立指定，与模块竖线保持距离 */
    paddingLeft: 12,
  },
  default: {
    background: "transparent",
    borderColor: "transparent",
    radius: "0",
    padding: 0,
  },
  vivid: {
    background: "#EA580C1A",
    borderColor: "#EA580C66",
    radius: "12px",
    padding: 12,
  },
  outline: {
    background: "transparent",
    borderColor: "transparent",
    radius: "0",
    padding: 12,
  },
};

const viewStyles: Record<string, ThemeViewStyle> = {
  default: {
    background: "transparent", // 默认容器背景透明
    padding: 0, // 默认容器不占用正文空间
    radius: 0, // 默认容器没有圆角
    color: "inherit", // 默认容器沿用页面文字颜色
  },
  frame: {
    background: "#ffffff", // 红色边框主题使用白色正文底板
    padding: 12, // 正文内容向白色底板内侧收进的距离
    radius: 18, // 白色底板的圆角
    color: "#222222", // 白色底板上的文字颜色
  },
};

// 根据样式 ID 读取模块外层样式，未知 ID 使用默认样式。
export const getThemeModuleStyle = (id: string) => moduleStyles[id] || moduleStyles.default;

// 根据样式 ID 读取模块项样式，未知 ID 使用默认样式。
export const getThemeItemStyle = (id: string) => itemStyles[id] || itemStyles.default;

// 根据样式 ID 读取正文容器样式，未知 ID 使用透明默认容器。
export const getThemeViewStyle = (id: string) => viewStyles[id] || viewStyles.default;
