import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "高光拼贴", // 主题显示名称
  id: "popCollage" as const, // 主题编号
  design: ["single-column", "premium"], // 单栏与臻品分类
  description: "黑色斜切姓名页眉、撞色标题条与描边错位投影卡片。", // 主题说明
  pageAppearance: { // 页面文字外观
    textColor: "#262626", // 暖白纸张上的正文文字颜色
  },
  decisions: { // 固定版式与个人信息内容能力
    layoutType: "topUserSingleColumn", // 顶部个人信息与单栏正文
  },
  ui: { // 用户可调参数的主题默认值
    theme: { // 配色与标题样式
      userTemplate: "popCollageUser", // 个人信息组件编号
      color: "#E96091", // 粉色主强调色
      titleTemplate: "popCollageTitle", // 拼贴色条标题样式
    },
    page: { // 纸张与公共留白
      background: "#FFF9EE", // 暖米色纸张
      padding: {
        vertical: 30, // 上下页边距
        horizontal: 36, // 左右页边距
      },
      spacing: {
        module: 24, // 模块间距
        paragraph: 12, // 段落间距
      },
    },
    font: { // 正文文字设置
      size: 15, // 正文字号
      lineHeight: 1.45, // 正文行高倍数
    },
    user: { // 页眉资料展示设置
      infoMode: "none", // 联系方式仅展示字段值
      infoLayout: "flex", // 联系方式按可用宽度换行
      infoPosition: "left", // 姓名与信息靠左
    },
  },
} satisfies ThemeTemplateConfig;
