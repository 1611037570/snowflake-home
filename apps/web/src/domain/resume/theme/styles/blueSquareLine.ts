import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "蓝线方标", // 主题显示名称
  id: "blueSquareLine" as const, // 主题编号
  design: ["single-column", "timeline", "minimal"], // 单栏、日期侧栏与简约分类
  description: "方形头像页眉、蓝色细线标题与左侧日期栏组成清爽简历。", // 主题说明
  decisions: { // 固定版式能力
    layoutType: "topUserSingleColumn", // 个人信息置顶且正文单栏
    usesDateRail: true, // 经历日期放入左侧固定栏
  },
  ui: { // 用户可调参数默认值
    theme: { // 配色和标题外观
      color: "#078BCB", // 蓝色文字与线条
      titleTemplate: "blueSquareLineTitle", // 蓝线方标标题
      titleIconMode: "none", // 标题只展示文字
    },
    page: { // 白纸与页面间距
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 42, horizontal: 30 }, // 上下与左右页边距
      spacing: { module: 21, paragraph: 9 }, // 模块和条目间距
    },
    font: { // 正文字体
      size: 16, // 正文字号
      lineHeight: 1.5, // 正文行距
    },
    content: { // 经历日期格式
      dateStyle: "dot", // 年月用点号分隔
    },
    user: { // 顶部资料排布
      avatarPosition: "left", // 头像在左
      infoPosition: "left", // 资料左对齐
      infoMode: "none", // 联系资料不显示图标标签
      infoLayout: "flex", // 联系资料随宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
