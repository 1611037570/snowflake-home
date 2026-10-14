import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "霓虹终端", // 主题显示名称
  id: "neonCircuit" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "深色网格纸、青色内框和品红光带组成赛博风双栏履历。", // 主题说明
  pageAppearance: { // 页面正文颜色
    textColor: "#E5F2F2", // 暗色纸张上使用浅色文字
  },
  decisions: { // 固定版式及内容组件
    layoutType: "topUserTwoColumn", // 个人信息通栏置顶，正文双栏
    pageBackgroundPattern: "neonCircuit", // 网格与内框背景
  },
  ui: { // 用户可编辑参数的主题默认值
    theme: { // 主题配色与标题样式
      color: "#6BF8F5", // 青色霓虹主色
      titleTemplate: "neonCircuitTitle", // 品红光带标题
      titleIconMode: "none", // 标题自身绘制双斜线
    },
    page: { // 纸张与留白
      background: "#0B0D13", // 深色纸张
      padding: { // 页面内边距
        vertical: 72, // 上下留白保持在发光内框内
        horizontal: 60, // 左右留白保持在发光内框内
      },
      spacing: { // 模块和段落间距
        module: 24, // 模块纵向间距
        paragraph: 9, // 正文段落间距
      },
    },
    font: { // 正文排版
      family: "Consolas, 'Courier New', monospace", // 终端风格等宽字体
      size: 14, // 正文字号
      lineHeight: 1.5, // 正文行高
    },
    layout: { // 双栏比例与模块位置
      leftColumnWidth: 46, // 左栏宽度百分比
      columns: { // 模块默认分栏
        left: ["skill", "education", "account"], // 技能和教育放左栏
        right: ["advantage", "work", "project"], // 简介和经历放右栏
      },
    },
    user: { // 个人资料展示方式
      infoPosition: "left", // 姓名和资料靠左
      infoMode: "text", // 联系信息使用文字标签
      infoLayout: "grid", // 联系信息逐行排列
    },
  },
} satisfies ThemeTemplateConfig;
