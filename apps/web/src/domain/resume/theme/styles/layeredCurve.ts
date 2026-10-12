import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "弧尾叠层",
  /** 主题与标题组件的匹配标识 */
  id: "layeredCurve" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"], // 移至极简分类
  /** 主题样式说明 */
  description: "标题落在三层渐浅的弧尾色块上，底部通栏细线。",
  /** 仅覆盖标题外观，条目沿用默认样式 */
  ui: {
    /** 标题色块的主题设置 */
    theme: {
      /** 标题色块使用靛蓝色 */
      color: "#4056A1",
      titleTemplate: "arcLayers", // 模块标题样式：弧尾叠层
    },
  },
} satisfies ThemeTemplateConfig;
