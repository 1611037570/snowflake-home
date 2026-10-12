import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "序号档案", // 主题显示名称
  id: "fileIndex" as const, // 主题编号，供外观组件按编号选择
  design: ["single-column", "minimal"], // 模板列表分类标签：单栏、简约
  description: "浅色档案纸搭配左侧大序号与纵向引导线，标题以细线收束。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    pageBorder: { // 主题固定纸张边框
      width: 1, // 边框宽度，单位像素
      color: "#D8E0E4", // 浅灰蓝装裱线避免压过正文
    },
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        inset: { // 区域四周装饰内边距
          top: 0, // 上侧装饰内边距
          right: 0, // 右侧装饰内边距
          bottom: 0, // 下侧装饰内边距
          left: 48, // 左侧索引栏，容纳放大的两位序号
        },
      },
    },
    layoutType: "singleColumn", // 单栏版式
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#3F5568", // 主题色：序号方块、标题文字与右延细线
      titleTemplate: "fileIndexHeading", // 模块标题样式：档案细线标题
      titleIconMode: "none", // 默认不显示图标，避免与左侧序号重复
    },
    page: { // 纸张留白与内容间距
      background: "#FCFDFD", // 微暖白纸张衬托浅色索引线
      padding: { vertical: 36, horizontal: 30 }, // 页面上下与左右留白
      spacing: { module: 24, paragraph: 9 }, // 模块间距与段落间距
    },
    font: { size: 14, lineHeight: 1.6 }, // 正文字号与行高倍数
    content: { datePosition: "right" }, // 经历日期默认靠右
  },
} satisfies ThemeTemplateConfig;
