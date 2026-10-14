import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "红黑工程师", // 主题显示名称。
  id: "redBlackEngineer" as const, // 主题编号。
  design: ["two-column", "premium"], // 模板分类。
  description: "红黑分区页眉、宽幅经历正文与浅灰技能侧栏。", // 模板说明。
  pageAppearance: {
    // 纸张外观。
    textColor: "#111111", // 正文默认文字颜色。
    bleedsPageTop: true, // 页眉背景铺到纸张顶边。
  },
  decisions: {
    // 主题固定布局能力。
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏。
    regions: {
      // 区域装饰尺寸。
      user: {
        // 个人信息区域。
        fillsPageTop: true, // 背景覆盖首页顶边。
        inset: {
          top: 0 /* 顶部装饰留白 */,
          right: 0 /* 右侧装饰留白 */,
          bottom: 24 /* 底部装饰留白 */,
          left: 0 /* 左侧装饰留白 */,
        }, // 页眉装饰留白。
      },
      main: {
        // 正文区域。
        columnDecoration: true, // 侧栏底板与中轴占据中缝，留白保留在栏内。
        joinsPrevious: true, // 正文紧接页眉。
        inset: {
          top: 24 /* 正文顶部留白 */,
          right: 0 /* 右侧装饰留白 */,
          bottom: 0 /* 底部装饰留白 */,
          left: 0 /* 左侧装饰留白 */,
        }, // 正文装饰留白。
      },
    },
  },
  ui: {
    // 主题默认用户参数。
    theme: {
      userTemplate: "redBlackEngineerUser", // 个人信息组件编号
      color: "#E81746" /* 页眉与标题强调色 */,
      titleTemplate: "diamondPrefix" /* 复用公共菱形前缀标题 */,
      titleIconMode: "none" /* 不显示额外模块图标 */,
    }, // 主题配色及标题。
    font: {
      size: 12 /* 正文字号 */,
      titleSize: 15 /* 模块标题字号 */,
      lineHeight: 1.6 /* 正文行高 */,
    }, // 默认文字排版。
    page: {
      // 页面留白与间距。
      background: "#FFFFFF", // 纸张底色。
      padding: { vertical: 24 /* 上下页边距 */, horizontal: 33 /* 左右页边距 */ }, // 页面边距。
      spacing: { module: 18 /* 模块间距 */, paragraph: 15 /* 条目间距 */ }, // 内容间距。
    },
    layout: {
      // 双栏设置。
      leftColumnWidth: 68, // 左侧正文宽度占比。
      columns: {
        // 默认模块栏位与顺序。
        left: ["advantage", "work", "internship", "project"], // 左栏介绍与经历。
        right: [
          "skill",
          "education",
          "honor",
          "account",
        ], // 右栏技能、教育及补充内容。
      },
    },
    user: {
      infoMode: "text" /* 联系方式标签形式 */,
      infoLayout: "grid" /* 联系方式布局 */,
      infoPosition: "left" /* 资料对齐方式 */,
      avatarPosition: "left" /* 头像有数据时位于姓名区域 */,
    }, // 个人信息设置。
    content: { datePosition: "right" /* 日期位于条目右侧 */, dateStyle: "dot" /* 年月分隔形式 */ }, // 条目日期设置。
  },
} satisfies ThemeTemplateConfig;
