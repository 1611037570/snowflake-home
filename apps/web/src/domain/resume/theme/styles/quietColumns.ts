import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "静线双栏", // 主题显示名称
  id: "quietColumns" as const, // 主题编号
  design: ["two-column", "minimal"], // 双栏与简约分类
  description: "大字个人信息、通栏细线与短横引导的双栏履历。", // 主题说明
  decisions: { // 固定页面版式
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
    regions: { // 页眉装饰留白
      user: { // 个人信息区域
        inset: { top: 0, right: 0, bottom: 24, left: 0 }, // 联系资料与底部分隔线的距离
      },
    },
  },
  ui: { // 主题默认参数
    theme: { color: "#222222", titleTemplate: "leadingDashTitle", titleIconMode: "none" }, // 配色与标题
    page: { // 页面外观
      background: "#FAFAFA", // 浅灰白纸张
      padding: { vertical: 48, horizontal: 45 }, // 页面边距
      spacing: { module: 24, paragraph: 12 }, // 正文间距
    },
    font: { color: "#555555", size: 14, lineHeight: 1.65 }, // 文字颜色与行距
    layout: { // 双栏分配
      leftColumnWidth: 50, // 左栏宽度比例
      columns: { left: ["advantage", "work", "internship"], right: ["skill", "education", "project", "honor", "account"] }, // 模块所在栏
    },
    user: { infoMode: "none", infoLayout: "flex", infoPosition: "left", avatarPosition: "right" }, // 通用个人信息排列
  },
} satisfies ThemeTemplateConfig;
