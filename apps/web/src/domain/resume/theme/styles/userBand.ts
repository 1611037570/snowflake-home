import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "通栏个人信息", // 主题显示名称
  id: "userBand" as const, // 主题编号
  design: ["single-column", "polished"], // 模板页的分类筛选标签
  description: "个人信息整块铺满页面宽度的主题色底纹，正文保持页面留白。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        inset: { // 区域四周装饰内边距
          top: 0, // 上侧装饰内边距
          right: 0, // 右侧装饰内边距
          bottom: 12, // 下侧装饰内边距
          left: 0, // 左侧装饰内边距
        },
        fillsPageTop: true, // 背景覆盖纸张顶边
      },
    },
    layoutType: "topUserSingleColumn", // 个人信息独占顶部通栏区域
  },
  ui: {
    // 主题相对默认配置的差异
    theme: {
      color: "#1D4ED8", // 主题色：同时作为个人信息底纹
    },
    font: { size: 15, lineHeight: 1.3 }, // 字号与行高
    page: {
      padding: { vertical: 24, horizontal: 24 }, // 页面上下与左右留白
      spacing: { module: 18 }, // 模块间距，同时决定底纹与下文之间的白边
    },
  },
} satisfies ThemeTemplateConfig;
