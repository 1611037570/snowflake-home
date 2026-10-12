import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "序号极简",
  /** 主题与标题组件的匹配标识 */
  id: "numberedSections" as const,
  /** 主题筛选分类 */
  design: ["single-column", "plain"],
  /** 主题样式说明 */
  description: "正文模块按当前顺序自动显示两位序号。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 模块序号使用的深蓝灰色 */
      color: "#42536B",
      /** 序号代替默认模块图标 */
      titleIconMode: "none",
    },
  },
} satisfies ThemeTemplateConfig;
