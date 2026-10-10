import type { ThemeTemplateConfig } from "./createThemeTemplate";

export default {
  name: "现代",
  id: "modern" as const, // 主题编号
  design: ["single-column", "polished"],
  description: "适合互联网与技术岗位的现代简历样式。",
  decisions: { // 主题固定尺寸与内容契约
    userContent: { // 个人信息内容契约
      renderer: "modernUser", // 内容组件编号
      split: "whole", // 整块展示或按稳定块分片
    },
  },
  ui: {
    theme: { color: "#2563EB", titleIconMode: "icon" },
    user: { avatarPosition: "center", infoPosition: "center" },
  },
} satisfies ThemeTemplateConfig;
