import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "青墨手记", // 主题显示名称
  id: "forestChalk" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "深绿细点纸纹、左右分列的个人信息，以及粉色三角与浅蓝波浪标题。", // 主题说明
  pageAppearance: { // 深色纸张上的正文颜色
    textColor: "#F0F2E9", // 正文使用柔和暖白色
  },
  decisions: { // 主题固定版式和个人信息内容
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
  },
  ui: { // 主题默认界面配置
    theme: { // 标题颜色与样式
      userTemplate: "forestChalkUser", // 个人信息组件编号
      color: "#A9D1E2", // 浅蓝标题主题色
      titleTemplate: "chalkWaveTitle", // 三角波浪标题样式
      titleIconMode: "none", // 标题自身绘制标记
    },
    page: { // 纸张底色和留白
      background: "#22483F", // 深墨绿色纸张
      padding: { // 页面内边距
        vertical: 30, // 上下留白
        horizontal: 30, // 左右留白
      },
      spacing: { // 正文模块间距
        module: 24, // 模块之间的垂直留白
      },
    },
    font: { // 正文排版
      family: "text-lxgw-wenkai-lite", // 使用现有文楷字体
      size: 14, // 正文字号
      lineHeight: 1.65, // 正文行高
    },
    layout: { // 双栏比例
      leftColumnWidth: 50, // 左栏占一半可用宽度
    },
    user: { // 个人信息字段显示
      infoMode: "none", // 右侧只显示字段值
      infoPosition: "left", // 姓名从左侧对齐
    },
  },
} satisfies ThemeTemplateConfig;
