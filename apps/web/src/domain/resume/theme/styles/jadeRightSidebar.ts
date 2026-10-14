import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "墨玉右栏", // 主题显示名称
  id: "jadeRightSidebar" as const, // 主题编号，各外观组件按此编号查找
  design: ["two-column", "polished"], // 模板列表分类标签：双栏、精致
  description: "云白纸张上一整列墨玉绿资料卡，烫金标签与宋体姓名反白呈现，经历在左栏舒展排布。", // 主题说明
  pageAppearance: { // 页面文字外观
    textColor: "#33403A", // 左栏正文使用冷墨绿灰
  },
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { main: { columnDecoration: true } }, // 栏间装饰占据中缝，留白保留在栏内
    layoutType: "twoColumnRightUser", // 个人信息固定在右窄栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题配色
      color: "#1C4536", // 右栏卡片底色与左栏强调色共用的墨玉绿
      titleTemplate: "dotTrailRule", // 模块标题样式：圆点引线
      titleIconMode: "none", // 标题只留文字，深浅栏靠引线区分层级
    },
    layout: { // 左右栏布局设置
      leftColumnWidth: 66, // 左宽栏容纳经历正文
      columns: { // 默认模块分栏
        left: ["work", "project", "education", "advantage"], // 左栏放工作、项目、教育与优势
        right: ["user", "skill", "honor", "account"], // 右栏放个人信息、技能、荣誉与账号
      },
    },
    page: { // 纸张与留白设置
      background: "#F6F7F4", // 云白纸张
      padding: { vertical: 36, horizontal: 36 }, // 页面四周留白
      spacing: { module: 28, paragraph: 10 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与行距
      size: 14, // 正文字号
      lineHeight: 1.62, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "dot", // 日期用「2026.9」形式
      datePosition: "right", // 经历日期靠条目右端
    },
    user: { // 个人信息默认展示
      avatarPosition: "center", // 头像居中落在资料卡顶部
      infoPosition: "center", // 姓名与资料居中排布
      infoMode: "text", // 联系资料显示文字标签
    },
  },
} satisfies ThemeTemplateConfig;
