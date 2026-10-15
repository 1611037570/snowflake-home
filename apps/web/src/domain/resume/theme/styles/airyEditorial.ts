import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "静序留白", // 主题显示名称
  id: "airyEditorial" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "居中个人信息、宽字距细线标题与大幅留白组成清晰的单栏履历。", // 主题说明
  decisions: { // 固定版式
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
  },
  ui: { // 主题初始界面参数
    theme: { // 主题色与标题组件
      color: "#253C54", // 深灰蓝强调色
      titleTemplate: "wideTrackingRule", // 宽字距细线标题组件
      titleIconMode: "none", // 标题不添加图标
    },
    page: { // 纸张与内容留白
      background: "#FFFFFF", // 白色纸张
      padding: { // 页面边距
        vertical: 42, // 上下页边距
        horizontal: 63, // 左右页边距
      },
      spacing: { // 正文间距
        module: 27, // 模块之间留白
        paragraph: 12, // 条目之间留白
      },
    },
    font: { // 正文字体外观
      color: "#253C54", // 深灰蓝正文颜色
      size: 15, // 正文字号
      titleSize: 16, // 模块标题字号
      lineHeight: 1.7, // 正文行高倍数
    },
    user: { // 通用个人信息组件的排列参数
      infoMode: "none", // 联系资料只显示字段值
      infoLayout: "flex", // 联系资料横向排列
      infoPosition: "center", // 姓名与资料居中
      avatarPosition: "center", // 有头像时置于姓名上方
    },
    content: { // 正文展示参数
      infoSeparator: "dot", // 联系资料使用圆点分隔
      datePosition: "right", // 经历日期靠右
    },
  },
} satisfies ThemeTemplateConfig;
