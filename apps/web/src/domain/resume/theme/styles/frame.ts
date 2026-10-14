import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "红色边框", // 主题显示名称
  id: "frame" as const, // 主题编号
  design: ["single-column", "premium"],
  description: "红色页面背景与白色正文容器。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        inset: { // 区域四周装饰内边距
          top: 12, // 上侧装饰内边距
          right: 12, // 右侧装饰内边距
          bottom: 12, // 下侧装饰内边距
          left: 12, // 左侧装饰内边距
        },
      },
    },
    layoutType: "topUserSingleColumn", // 个人信息通栏、正文单栏的布局编号
  },
  ui: {
    // 主题相对默认配置的差异
    theme: {
      // 主题元素配置
      color: "#B5093B", // 标题等元素使用的主题色
      titleTemplate: "roundedTabRule", // 模块标题样式：圆角标签块
    },
    page: {
      // 页面外观配置
      background: "#B5093B", // 页面红色背景
      padding: {
        // 页面四周留白
        vertical: 42, // 页面上下留白
        horizontal: 42, // 页面左右留白
      },
    },
  },
} satisfies ThemeTemplateConfig;
