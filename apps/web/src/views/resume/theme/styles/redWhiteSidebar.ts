export default {
  name: "红白双栏", // 主题显示名称
  id: "redWhiteSidebar", // 主题编号，用于查找对应外观组件
  design: ["two-column", "minimal"], // 模板分类：双栏、简约
  description: "深红侧栏搭配白色正文与红色横线标题。", // 主题说明
  ui: { // 主题相对默认设置的差异
    theme: { // 主题配色与标题设置
      color: "#B00035", // 左栏背景及右栏标题使用的深红色
      titleIconMode: "none", // 标题默认不显示图标
    },
    layout: { // 双栏布局设置
      type: "twoColumn", // 个人信息放在左栏的双栏布局
      leftColumnWidth: 27, // 左栏占可用栏宽的百分比
      columns: { // 默认模块栏位
        left: ["user", "skill", "honor", "account"], // 左栏展示个人信息、技能、证书和账号
        right: ["advantage", "work", "project", "education"], // 右栏展示个人优势与经历
      },
    },
    page: { // 页面外观设置
      background: "#FFFFFF", // 右栏与纸张默认背景色
    },
    user: { // 个人信息默认展示设置
      avatarPosition: "left", // 头像默认在上方靠左，仍支持位置切换
      infoPosition: "left", // 姓名及信息靠左对齐
      infoMode: "text", // 个人信息使用文字标签
    },
    content: { // 经历展示设置
      datePosition: "right", // 日期放在条目右侧
    },
  },
};
