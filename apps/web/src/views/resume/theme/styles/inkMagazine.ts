export default {
  name: "墨色杂志", // 主题显示名称
  id: "inkMagazine", // 主题编号，用于查找外观组件
  design: ["two-column", "minimal"], // 模板分类：双栏、简约
  description: "大字号姓名与短线标题，浅灰辅助栏搭配白色经历栏。", // 主题说明
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题设置
      color: "#202020", // 页眉、标题及分隔线使用的墨色
      titleIconMode: "none", // 模块标题默认不显示图标
    },
    layout: { // 正文布局设置
      type: "topUserTwoColumn", // 个人信息顶部通栏，正文左右双栏
      leftColumnWidth: 32, // 左栏占正文可用栏宽的百分比
      columns: { // 模块默认栏位
        left: ["advantage", "skill", "honor", "account"], // 左栏放个人总结、技能、证书和账号
        right: ["work", "project", "education"], // 右栏放工作、项目和教育经历
      },
    },
    page: { // 纸张与间距设置
      background: "#FFFFFF", // 白色纸张背景
      spacing: { // 内容间距
        module: 30, // 模块之间的纵向距离
        paragraph: 9, // 条目及段落之间的纵向距离
      },
    },
    font: { // 文字设置
      size: 14, // 正文字号
      titleSize: 17, // 模块标题字号
      lineHeight: 1.65, // 正文行高倍数
    },
    user: { // 顶部个人信息设置
      avatarPosition: "right", // 头像默认居右，仍支持切换位置
      infoPosition: "left", // 姓名及信息默认靠左
      infoLayout: "flex", // 信息按可用宽度自动换行
      infoMode: "text", // 个人信息使用文字标签
    },
    content: { // 经历条目设置
      datePosition: "right", // 日期显示在条目右侧
    },
  },
};
