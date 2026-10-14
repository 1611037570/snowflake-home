import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "岁序", // 主题显示名称
  id: "chronicleRail" as const, // 主题编号，各外观组件按此编号查找
  design: ["two-column", "timeline", "polished"], // 模板列表分类标签：双栏、时间轴、精致
  description: "暖纸通栏页眉下，烫金时间轴贯穿宽栏经历，菱形节点标记每段日期，辅模块收进浅底窄栏。", // 主题说明
  pageAppearance: { // 页面文字外观
    textColor: "#3B372F", // 正文与标题使用暖墨色
  },
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { main: { columnDecoration: true } }, // 栏间装饰占据中缝，留白保留在栏内
    usesDateRail: true, // 经历使用固定日期栏
    layoutType: "topUserTwoColumn", // 个人信息顶部通栏、正文双栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题配色
      color: "#1F3B54", // 姓名与日期使用的墨蓝
      titleTemplate: "timelineIndent", // 模块标题样式：时间轴缩进
      titleIconMode: "none", // 标题只留文字，层级由轴线节点承担
    },
    layout: { // 左右栏布局设置
      leftColumnWidth: 66, // 左宽栏留出经历与日期栏
      columns: { // 默认模块分栏
        left: ["work", "project", "education"], // 宽栏放工作、项目与教育经历
        right: ["advantage", "skill", "honor", "account"], // 窄栏放优势、技能、荣誉与账号
      },
    },
    page: { // 纸张与留白设置
      background: "#FAF7F0", // 象牙暖纸
      padding: { vertical: 30, horizontal: 34 }, // 页面四周留白
      spacing: { module: 24, paragraph: 10 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与行距
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "dot", // 日期用「2026.9」形式，适配日期栏宽度
    },
    user: { // 个人信息默认展示
      avatarPosition: "right", // 头像默认靠右
      infoPosition: "left", // 姓名与资料靠左
      infoMode: "icon", // 联系方式显示图标
      infoLayout: "flex", // 资料随可用宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
