export default {
  name: "米色侧栏", // 主题显示名称
  id: "sandSidebar", // 主题编号
  design: ["two-column", "minimal"], // 模板分类：双栏、简约
  description: "米色侧栏搭配金棕色短线标题，简洁展示个人信息与经历。", // 主题说明
  ui: { // 主题相对默认设置的差异
    theme: { // 主题色与标题外观设置
      color: "#A58D65", // 姓名、标题及装饰线使用的金棕色
      titleIconMode: "none", // 标题仅展示文字和短下划线
    },
    layout: { // 左右栏布局设置
      type: "twoColumn", // 个人信息位于左栏的双栏布局
      leftColumnWidth: 35, // 左栏占可用栏宽的百分比
      columns: { // 左右栏的默认模块顺序
        left: ["user", "skill", "honor", "account"], // 左栏展示个人信息、技能、证书和社交账号
        right: ["education", "advantage", "project", "work"], // 右栏展示教育、个人优势、项目和工作经历
      },
    },
    page: { // 纸张与模块留白设置
      background: "#FFFFFF", // 右栏及纸张底色
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
      titleSize: 18, // 模块标题字号
      lineHeight: 1.65, // 正文行高倍数
    },
    user: { // 个人信息默认展示设置
      avatarPosition: "left", // 头像默认在上方靠左，仍支持切换位置
      infoPosition: "left", // 姓名及联系方式靠左对齐
      infoMode: "icon", // 联系方式默认显示图标
    },
    content: { // 条目默认展示设置
      datePosition: "right", // 经历日期显示在右侧
    },
  },
};
