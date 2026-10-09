export default {
  name: "通栏双栏",
  id: "topUserTwoColumn",
  design: ["two-column"],
  description: "个人信息顶部通栏，其余模块固定分到左右两栏。",
  decisions: { // 主题固定外观，不进入用户界面配置
    layoutType: "topUserTwoColumn", // 主题固定页面版式
  },
  ui: {
    theme: { color: "#0F766E" },
  },
};
