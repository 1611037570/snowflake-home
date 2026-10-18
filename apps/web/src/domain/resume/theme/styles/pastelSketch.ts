import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "柔彩画纸", // 主题显示名称
  id: "pastelSketch" as const, // 主题编号
  design: ["single-column", "premium"], // 单栏与臻品分类
  description: "奶油色画纸与柔彩光晕衬托个人信息，粉彩虚线引导正文标题。", // 主题说明
  decisions: { // 主题固定版式
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    layoutType: "topUserSingleColumn", // 个人信息与正文保持公共单栏布局
  },
  ui: { // 主题默认界面配置
    font: { color: "#514A4C" }, // 正文使用柔和的深灰棕
    theme: { // 主题配色与标题
      color: "#C96F89", // 柔和玫瑰粉主题色
      titleTemplate: "pastelDashTitle", // 粉彩虚线标题样式
      titleIconMode: "none", // 楷体标题不重复绘制模块图标
    },
    page: { // 页面底色与留白
      background: "#FFFCF7", // 奶油白纸张底色
      padding: { // 纸张内边距
        vertical: 30, // 页面上下留白
        horizontal: 36, // 页面左右留白
      },
      spacing: { // 正文模块间距
        module: 21, // 模块之间保持轻盈留白
      },
    },
    user: { // 个人信息保持通用内容布局
      avatarPosition: "left", // 头像位于左侧
      infoPosition: "left", // 姓名与联系方式左对齐
    },
  },
} satisfies ThemeTemplateConfig;
