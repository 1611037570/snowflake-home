export interface ThemeItemStyle {
  background: string;
  borderColor: string;
  radius: string;
  padding: number;
}

const moduleStyles: Record<string, { frame: "default" | "outline" }> = {
  default: { frame: "default" },
  outline: { frame: "outline" },
};

const itemStyles: Record<string, ThemeItemStyle> = {
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

// 根据样式 ID 读取模块外层样式，未知 ID 使用默认样式。
export const getThemeModuleStyle = (id: string) => moduleStyles[id] || moduleStyles.default;

// 根据样式 ID 读取模块项样式，未知 ID 使用默认样式。
export const getThemeItemStyle = (id: string) => itemStyles[id] || itemStyles.default;
