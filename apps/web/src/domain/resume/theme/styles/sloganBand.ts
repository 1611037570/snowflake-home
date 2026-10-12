import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "标语通栏", // 主题显示名称
  id: "sloganBand" as const, // 主题编号
  design: ["single-column", "polished"], // 模板页的分类筛选标签
  description: "顶部标语色带搭配飘带底沿，适合突出个人主张的通用简历。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    topDecoration: "sloganBand", // 首页顶部独立品牌标语装饰
    layoutType: "topUserSingleColumn", // 标语与个人信息各自独占通栏区域
    regions: { // 区域背景的铺满能力
      user: { // 个人信息区域
        fillsPageTop: true, // 个人信息背景铺满纸张宽度
      },
    },
  },
  ui: {
    // 主题相对默认配置的差异
    theme: {
      color: "#C92327", // 主题色：标语、个人信息背景与标题统一使用红色
      titleTemplate: "slantedBands", // 模块标题样式：斜纹色带
    },
    font: { size: 15, lineHeight: 1.3 }, // 字号与行高
    page: {
      padding: { vertical: 24, horizontal: 24 }, // 页面上下与左右留白
      spacing: { module: 18 }, // 模块之间的间距；标语与个人信息之间由个人信息自身留白
    },
  },
} satisfies ThemeTemplateConfig;
