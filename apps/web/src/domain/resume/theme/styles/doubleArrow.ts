import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "双三角引线",
  /** 主题与标题组件的匹配标识 */
  id: "doubleArrow" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"], // 移至极简分类
  /** 主题样式说明 */
  description: "标题前一组深浅双三角，右侧细线沿中线延伸。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 三角、标题与横线的主题色 */
      color: "#B60032",
      titleTemplate: "twinTriangleRule", // 模块标题样式：双三角引线
    },
  },
} satisfies ThemeTemplateConfig;
