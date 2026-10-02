export default {
  name: "宋韵雅致", // 主题显示名称
  id: "songElegance", // 主题编号，供各外观组件按编号选择
  design: ["single-column", "minimal"], // 模板列表分类标签：单栏、简约
  description: "宋体字配米色纸张与细线装裱页边，双线标题收束模块。", // 主题说明
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题装饰
      color: "#8A6A4F", // 茶褐色：姓名、标题与装饰线
      titleIconMode: "none", // 模块标题默认只保留文字与双线
    },
    page: { // 纸张与页面留白
      background: "#FBF8F1", // 米色纸张，接近宣纸
      radius: 0, // 平直页角，接近印刷品
      border: { width: 1, color: "#D9CDB8" }, // 细线装裱页边
      padding: { vertical: 42, horizontal: 48 }, // 大留白页边距
      spacing: { module: 30, paragraph: 12 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与字体
      family: "text-source-han-serif", // 思源宋体，中文衬线
      size: 14, // 正文字号
      titleSize: 17, // 模块标题字号
      lineHeight: 1.75, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "cn", // 日期使用「2026年9月」形式
      datePosition: "right", // 日期显示在条目右侧
      infoSeparator: "line", // 并列信息用竖线分隔
    },
    layout: { // 页面布局
      type: "singleColumn", // 单栏版式，突出纵向留白
    },
    user: { // 顶部个人信息排列
      infoMode: "text", // 联系方式显示字段文字
      infoLayout: "flex", // 信息随可用宽度换行
      avatarPosition: "center", // 头像居中
      infoPosition: "center", // 姓名与联系方式居中
    },
  },
};
