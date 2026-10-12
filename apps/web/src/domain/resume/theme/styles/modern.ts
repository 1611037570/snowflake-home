import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "居中短横线", // 主题显示名称，与标题样式同名
  id: "modern" as const, // 主题编号
  design: ["single-column", "polished", "plain"], // 现代主题也归入极简分类
  description: "标题居中，下方一小段主题色短横线。", // 主题说明，描述标题样式
  decisions: { // 主题固定尺寸与内容契约
    userContent: { // 个人信息内容契约
      renderer: "modernUser", // 内容组件编号
      split: "whole", // 整块展示或按稳定块分片
    },
  },
  ui: {
    theme: {
      color: "#2563EB",
      titleTemplate: "centeredShortRule", // 模块标题样式：居中短横线
    },
    user: { avatarPosition: "center", infoPosition: "center" },
  },
} satisfies ThemeTemplateConfig;
