import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "蓝色双语", // 主题显示名称
  id: "blueBilingual" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "通栏蓝色个人信息页眉，正文使用中英双语横带标题。", // 主题说明
  decisions: { // 主题固定版式
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        inset: { // 区域内部留白
          top: 0, // 顶部额外留白
          right: 0, // 右侧额外留白
          bottom: 18, // 页眉底部留白
          left: 0, // 左侧额外留白
        },
        fillsPageTop: true, // 蓝色页眉覆盖纸张顶边
      },
    },
  },
  ui: { // 主题默认界面参数
    theme: { // 主题颜色与标题样式
      color: "#2563EB", // 蓝色主色
      titleTemplate: "blueBilingualTitle", // 中英双语横带标题
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
