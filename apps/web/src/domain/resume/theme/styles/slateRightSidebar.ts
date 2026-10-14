import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "灰蓝右栏", // 主题显示名称
  id: "slateRightSidebar" as const, // 主题编号
  design: ["two-column", "plain"], // 模板分类：双栏、极简
  description: "灰蓝窄栏收纳个人信息与技能，正文在左栏展开，极简排版适合直接投递。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { main: { columnDecoration: true } }, // 栏间装饰占据中缝，留白保留在栏内
    layoutType: "twoColumnRightUser", // 右栏窄且个人信息固定在右栏的双栏布局
  },
  ui: { // 主题相对默认设置的差异
    theme: { // 主题色设置
      color: "#4B6478", // 姓名、标题及栏底色使用的灰蓝
      titleTemplate: "hairlineRule", // 模块标题样式：字距加宽加一条极细底线
    },
    layout: { // 左右栏布局设置
      leftColumnWidth: 62, // 左栏占可用栏宽的百分比，余量留给右侧窄栏
      columns: { // 左右栏的默认模块顺序
        left: ["education", "advantage", "project", "work"], // 左宽栏展示教育、个人优势、项目和工作经历
        right: ["user", "skill", "honor", "account"], // 右窄栏展示个人信息、技能、荣誉和社交账号
      },
    },
    page: { // 纸张与模块留白设置
      background: "#FFFFFF", // 左栏及纸张底色
      padding: { // 页面四周的内容留白
        vertical: 36, // 页面上下留白
        horizontal: 36, // 页面左右留白
      },
      spacing: { // 内容之间的纵向间距
        module: 30, // 模块之间的间距
        paragraph: 12, // 条目与段落之间的间距
      },
    },
    font: { // 文字尺寸与行距
      size: 14, // 正文字号
      lineHeight: 1.65, // 正文行高倍数
    },
    user: { // 个人信息默认展示设置
      avatarPosition: "center", // 头像默认在右侧窄栏居中，仍支持切换位置
      infoPosition: "center", // 姓名及联系方式默认居中
      infoMode: "icon", // 联系方式默认显示图标
    },
    content: { // 条目默认展示设置
      datePosition: "right", // 经历日期显示在右侧
    },
  },
} satisfies ThemeTemplateConfig;
