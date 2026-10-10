import type { ThemeTemplateConfig } from "./createThemeTemplate";

export default {
  name: "蓝线简历", // 主题显示名称
  id: "navyGuide" as const, // 主题编号，供各外观组件按编号选择
  design: ["single-column", "polished"], // 模板列表的分类标签
  description: "深色页眉搭配蓝色纵向引导线，突出个人信息和经历层次。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        inset: { // 区域四周装饰内边距
          top: 0, // 上侧装饰内边距
          right: 0, // 右侧装饰内边距
          bottom: 0, // 下侧装饰内边距
          left: 30, // 左侧装饰内边距
        },
      },
    },
    topDecoration: "navyGuide", // 首页顶部独立色带
    layoutType: "topUserSingleColumn", // 个人信息顶部通栏，正文单栏
  },
  ui: {
    theme: {
      color: "#7C8CF4", // 色带端块、头像衬边和正文标记使用的主题色
      titleIconMode: "none", // 标题使用主题自身的竖条标记
    },
    page: {
      padding: { vertical: 24, horizontal: 48 }, // 页面上下与左右留白
    },
    user: {
      avatarPosition: "left", // 头像位于个人信息左侧
      infoPosition: "left", // 姓名及资料左对齐
      infoMode: "icon", // 联系方式展示图标
      infoLayout: "flex", // 个人资料按可用宽度自然换行
    },
  },
} satisfies ThemeTemplateConfig;
