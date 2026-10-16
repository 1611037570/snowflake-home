import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "宋韵雅致", // 主题显示名称
  id: "songElegance" as const, // 主题编号，供各外观组件按编号选择
  design: ["single-column", "minimal", "recommended"], // 保留单栏与简约归属，同时进入推荐。
  description: "宋体字配米色纸张与细线装裱页边，双线标题收束模块。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    pageBorder: { // 主题固定纸张边框
      width: 1, // 边框宽度
      color: "#D9CDB8", // 边框颜色
    },
    layoutType: "singleColumn", // 单栏版式，突出纵向留白
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色
      color: "#8A6A4F", // 茶褐色：姓名、标题与装饰线
      titleTemplate: "doubleRuleTitle", // 模块标题样式：双线夹标题
    },
    page: { // 纸张与页面留白
      background: "#FBF8F1", // 米色纸张，接近宣纸
      padding: { vertical: 42, horizontal: 48 }, // 大留白页边距
      spacing: { module: 30, paragraph: 12 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与字体
      family: "text-source-han-serif", // 思源宋体，中文衬线
      size: 14, // 正文字号
      lineHeight: 1.75, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "cn", // 日期使用「2026年9月」形式
      datePosition: "right", // 日期显示在条目右侧
      infoSeparator: "line", // 并列信息用竖线分隔
    },
    user: { // 顶部个人信息排列
      infoMode: "text", // 联系方式显示字段文字
      infoLayout: "flex", // 信息随可用宽度换行
      avatarPosition: "center", // 头像居中
      infoPosition: "center", // 姓名与联系方式居中
    },
  },
} satisfies ThemeTemplateConfig;
