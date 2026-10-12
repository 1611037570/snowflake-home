import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "荧光网格",
  /** 主题与标题组件的匹配标识 */
  id: "markerGrid" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "minimal"], // 移至简约分类
  /** 主题样式说明 */
  description: "浅灰虚线网格铺满页面，荧光笔刷底纹突出模块标题。",
  /** 页面与标题的外观配置 */
  decisions: { // 主题固定外观，不进入用户界面配置
    pageBackgroundPattern: "dashedGrid", // 主题固定页面纹理
  },
  ui: {
    /** 标题底纹主题设置 */
    theme: {
      /** 标题笔刷底纹使用荧光绿 */
      color: "#BEFF38",
      titleTemplate: "highlightBrush", // 模块标题样式：荧光笔触
    },
  },
} satisfies ThemeTemplateConfig;
