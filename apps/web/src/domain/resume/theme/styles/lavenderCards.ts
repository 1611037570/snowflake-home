import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "雾紫卡片", // 主题显示名称
  id: "lavenderCards" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "紫色到浅蓝的柔和纸张渐变，搭配白色圆角卡片与渐变方点标题。", // 主题说明
  pageAppearance: { // 页面正文颜色
    textColor: "#000000", // 浅色纸张上的正文固定使用黑色
  },
  decisions: { // 主题固定版式
    layoutType: "topUserTwoColumn", // 通用个人信息置顶、正文双栏
  },
  ui: { // 主题默认界面配置
    theme: { // 主题颜色与标题
      color: "#7130D9", // 紫色强调色
      titleTemplate: "lavenderDotTitle", // 渐变方点标题
      titleIconMode: "none", // 方点由标题组件绘制
    },
    page: { // 纸张和间距
      background: "#F6F3FF", // 渐变下的淡紫底色
      padding: { // 页面内边距
        vertical: 36, // 上下留白
        horizontal: 36, // 左右留白
      },
      spacing: { // 正文间距
        module: 24, // 卡片之间的垂直间距
        paragraph: 12, // 条目之间的垂直间距
      },
    },
    font: { // 正文排版
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高
    },
    layout: { // 双栏宽度与模块默认顺序
      leftColumnWidth: 50, // 左栏占可用宽度的一半
      columns: { // 双栏模块分配
        left: ["advantage", "work", "project"], // 左栏展示介绍与经历
        right: ["skill", "education", "honor", "account"], // 右栏展示技能与补充资料
      },
    },
  },
} satisfies ThemeTemplateConfig;
