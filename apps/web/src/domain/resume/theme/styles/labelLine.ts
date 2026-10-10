import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "色块横线",
  /** 主题与标题组件的匹配标识 */
  id: "labelLine" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "polished"],
  /** 主题样式说明 */
  description: "深色矩形标题搭配底部延伸横线，简洁正式。",
  /** 仅覆盖标题相关外观，条目沿用默认样式 */
  ui: {
    /** 标题色块使用深蓝主题色 */
    theme: {
      /** 标题色块底色 */
      color: "#1E3A5F",
      /** 默认隐藏标题图标以贴合参考样式 */
      titleIconMode: "none",
    },
  },
} satisfies ThemeTemplateConfig;
