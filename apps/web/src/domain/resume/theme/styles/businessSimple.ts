import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import business from "./business";

// 保留原商务标题与页面参数，个人信息使用公共默认外观。
export default {
  ...business,
  name: "商务极简", // 主题显示名称
  id: "businessSimple" as const, // 主题编号
  design: ["single-column", "plain"], // 模板筛选分类
  description: "保留经典商务标题，以简洁的个人信息呈现内容。", // 主题说明
} satisfies ThemeTemplateConfig;
