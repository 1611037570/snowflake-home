import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "黑框资料", // 主题显示名称
  id: "frameProfile" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "黑色直角框围住页眉资料，姓名放大、联系方式带图标逐行排列。", // 主题说明
  decisions: { // 固定版式与个人信息内容能力
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    layoutType: "topUserSingleColumn", // 顶部个人信息与单栏正文
  },
  ui: { // 用户可调参数的主题默认值
    theme: { // 配色与标题样式
      userTemplate: "frameProfileUser", // 个人信息组件编号
      color: "#111111", // 近黑主强调色，与页眉直角框同色
      titleTemplate: "tintOnly", // 复用浅色底纹的通栏背景标题
      titleIconMode: "none", // 实色条上不叠加模块图标
    },
    page: { // 纸张与公共留白
      background: "#FFFFFF", // 白色纸张
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
      color: "#111111", // 白色纸张上的正文文字颜色
      size: 15, // 正文字号
      lineHeight: 1.45, // 正文行高倍数
    },
    user: { // 页眉资料展示设置
      infoMode: "icon", // 联系方式标签使用字段图标
      infoLayout: "grid", // 资料逐行排列
      infoPosition: "left", // 姓名与信息靠左
      avatarPosition: "left", // 有头像时位于资料左侧
    },
  },
} satisfies ThemeTemplateConfig;
