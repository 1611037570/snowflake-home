import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "蓝色折角", // 主题显示名称
  id: "blueAngleHeader" as const, // 主题编号
  design: ["single-column", "minimal", "recommended"], // 保留单栏与简约归属，同时进入推荐。
  description: "顶部折角蓝线、横向个人信息和斜角标签标题。", // 主题说明
  decisions: { // 主题固定版式
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
    topDecoration: "blueAngleHeader", // 首页顶部折角蓝线
  },
  ui: { // 主题默认界面参数
    theme: { // 主题颜色与标题样式
      color: "#2563EB", // 蓝色主色
      titleTemplate: "blueAngleHeaderTitle", // 斜角标签标题
      titleIconMode: "none", // 标题不显示图标
    },
    page: { // 页面背景和间距
      background: "#FFFFFF", // 白色纸张
      padding: { // 页面内边距
        vertical: 24, // 上下留白
        horizontal: 36, // 左右留白
      },
      spacing: { // 模块与段落间距
        module: 21, // 模块之间留白
        paragraph: 9, // 正文段落间距
      },
    },
    font: { // 字体参数
      size: 16, // 正文字号
      titleSize: 20, // 标题字号
      lineHeight: 1.5, // 正文行高
    },
    user: { // 个人信息排列
      avatarPosition: "left", // 头像置左
      infoPosition: "left", // 姓名与资料左对齐
      infoMode: "none", // 联系资料仅显示字段值
      infoLayout: "flex", // 联系资料横向换行
    },
  },
} satisfies ThemeTemplateConfig;
