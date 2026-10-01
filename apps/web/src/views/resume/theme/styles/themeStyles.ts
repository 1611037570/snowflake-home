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

// 根据样式 ID 读取正文容器样式，未知 ID 使用透明默认容器。
export const getThemeViewStyle = (id: string) => viewStyles[id] || viewStyles.default;
