import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "蓝色资料横带", // 主题显示名称
  id: "blueProfileBand" as const, // 主题编号
  design: ["single-column", "minimal", "recommended"], // 正文单栏且标题只输出一次，保留简约并加入推荐。
  description: "横向头像资料区搭配蓝色胶囊标题和浅蓝横带。", // 主题说明
  decisions: { // 主题固定版式
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
  },
  ui: { // 主题默认界面参数
    theme: { // 主题颜色与标题样式
      color: "#2563EB", // 蓝色主色
      titleTemplate: "blueProfileBandTitle", // 胶囊横带标题
      titleIconMode: "none", // 标题不显示图标
    },
    page: { // 页面背景和间距
      background: "#FFFFFF", // 白色纸张
      padding: { // 页面内边距
        vertical: 24, // 上下留白
        horizontal: 24, // 左右留白
      },
      spacing: { // 模块与段落间距
        module: 24, // 模块之间留白
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
      infoMode: "text", // 资料显示文字标签
      infoLayout: "grid", // 资料按网格排列
    },
  },
} satisfies ThemeTemplateConfig;
