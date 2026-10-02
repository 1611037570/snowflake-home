export default {
  name: "青色卡片", // 主题显示名称
  id: "tealCard", // 外观组件统一使用的主题编号
  design: ["single-column", "polished"], // 模板列表分类标签
  description: "青色顶带与圆形图标标题，每个模块的正文共用白色圆角卡片。", // 主题说明
  ui: { // 主题覆盖的界面配置
    theme: { // 主题颜色与标题图标
      color: "#187F89", // 顶带、标题与图标底色
      titleIconMode: "circle", // 标题图标显示圆形底托
    },
    page: { // 页面外观与留白
      background: "#F4F8FA", // 无纹理的浅灰页面底色
      radius: 0, // 平直纸张边角
      padding: { vertical: 36, horizontal: 36 }, // 页面上下与左右留白
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 头像靠右
      infoPosition: "left", // 资料靠左
      infoMode: "text", // 联系资料显示字段文字
      infoLayout: "flex", // 资料随可用宽度换行
    },
    layout: { // 页面布局
      type: "topUserSingleColumn", // 顶部个人信息通栏，正文单栏
    },
  },
};
