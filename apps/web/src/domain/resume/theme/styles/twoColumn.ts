import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "双栏",
  id: "twoColumn" as const, // 主题编号
  design: ["two-column"],
  description: "所有模块固定分到左右两栏，适合内容较多的简历。",
  // 页面级外观：栏底色铺满页高，首页也要盖住纸张顶部留白
  pageAppearance: {
    bleedsPageTop: true, // 首页顶部由栏底色铺到纸张顶边
  },
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { main: { columnDecoration: true } }, // 栏间装饰占据中缝，留白保留在栏内
    layoutType: "twoColumn", // 主题固定页面版式
  },
  ui: {
    theme: {
      color: "#7C3AED",
      titleTemplate: "barColorTitle", // 模块标题样式：圆条标题
    },
    user: { avatarPosition: "center", infoPosition: "center" }, // 双栏头像、姓名与资料默认居中，仍可通过位置设置调整
  },
} satisfies ThemeTemplateConfig;
