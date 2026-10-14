import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "细线刻度", // 主题显示名称
  id: "hairlineRail" as const, // 主题编号，各外观组件按此编号查找
  design: ["single-column", "timeline", "minimal"], // 模板列表分类标签：单栏、时间轴、简约
  description: "一条极细时间轴贯穿左侧，主题色短刻度标记每段经历，正文保持素净排布。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    usesDateRail: true, // 经历使用固定日期栏
    layoutType: "topUserSingleColumn", // 个人信息顶部通栏、正文单栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题配色
      color: "#3F6B7D", // 深青灰刻度与标题色
      titleTemplate: "timelineIndent", // 模块标题样式：时间轴缩进
    },
    page: { // 纸张与留白设置
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 36, horizontal: 42 }, // 页面四周留白，左侧余量给日期栏
      spacing: { module: 24, paragraph: 12 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与行距
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "dot", // 日期用「2026.9」形式，适配较窄的日期栏
    },
    user: { // 个人信息默认展示
      avatarPosition: "right", // 头像默认靠右
      infoPosition: "left", // 姓名与资料靠左
      infoMode: "icon", // 联系方式显示图标
      infoLayout: "flex", // 资料随可用宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
