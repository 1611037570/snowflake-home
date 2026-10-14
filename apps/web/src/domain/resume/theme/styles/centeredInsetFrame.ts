import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "居中内签", // 主题显示名称
  id: "centeredInsetFrame" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "居中个人信息、内缩蓝色标题签与完整的模块细边框。", // 主题说明
  decisions: { // 主题固定版式
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
    regions: { // 区域装饰空间
      user: { // 个人信息区域
        inset: { // 四周留白，单位像素
          top: 0, // 顶部沿用公共页边距
          right: 0, // 右侧沿用公共页边距
          bottom: 24, // 与正文之间的留白
          left: 0, // 左侧沿用公共页边距
        },
      },
    },
  },
  ui: { // 用户可调参数的主题默认值
    theme: { // 配色和标题样式
      color: "#2563EB", // 蓝色标题签
      titleTemplate: "centeredInsetLabel", // 框内内缩标题签
      titleIconMode: "none", // 不重复显示标题图标
    },
    page: { // 纸张背景和留白
      background: "#FFFFFF", // 白色纸张
      padding: { // 纸张内边距
        vertical: 48, // 上下留白
        horizontal: 36, // 左右留白
      },
      spacing: { // 模块和段落间距
        module: 18, // 模块之间的留白
        paragraph: 9, // 正文段落间距
      },
    },
    font: { // 正文字体参数
      size: 16, // 正文字号
      titleSize: 18, // 标题签字号
      lineHeight: 1.5, // 正文行高
    },
    user: { // 个人信息排列
      avatarPosition: "center", // 头像居中
      infoPosition: "center", // 姓名和联系方式居中
      infoMode: "none", // 联系资料只显示值
      infoLayout: "flex", // 联系资料横向排列并换行
    },
  },
} satisfies ThemeTemplateConfig;
