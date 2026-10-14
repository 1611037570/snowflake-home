import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "青线双栏", // 主题显示名称
  id: "tealRail" as const, // 主题编号，供外观组件按编号选择
  design: ["two-column", "timeline"], // 模板列表的分类标签
  description: "左侧个人资料与右侧经历以青色竖线和节点连接。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    layoutType: "twoColumn", // 个人信息位于左栏的双栏布局
  },
  ui: {
    theme: {
      userTemplate: "tealRailUser", // 个人信息组件编号
      color: "#49BDB6", // 竖线与标题节点的主题色
      titleTemplate: "railDotRule", // 模块标题样式：轴线圆点
    },
    page: {
      padding: { vertical: 48, horizontal: 48 }, // 页面外侧留白
      spacing: { module: 24 }, // 模块之间的默认距离
    },
    layout: {
      leftColumnWidth: 40, // 左栏所占宽度比例
      columns: {
        left: ["user", "honor", "account", "skill"], // 左栏资料模块顺序
        right: ["work", "advantage"], // 右栏经历模块顺序
      },
    },
    user: {
      avatarPosition: "center", // 头像默认居中
      infoPosition: "center", // 姓名与资料默认居中
    },
  },
} satisfies ThemeTemplateConfig;
