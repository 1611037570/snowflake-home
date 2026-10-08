export default {
  name: "双栏",
  id: "twoColumn",
  design: ["two-column"],
  description: "所有模块固定分到左右两栏，适合内容较多的简历。",
  // 页面级外观：栏底色铺满页高，首页也要盖住纸张顶部留白并沿用顶部圆角
  pageAppearance: {
    bleedsPageTop: true, // 首页顶部由栏底色铺到纸张顶边
  },
  ui: {
    theme: { color: "#7C3AED" },
    layout: { type: "twoColumn" },
    user: { avatarPosition: "left" }, // 双栏头像默认居左，后续仍可通过头像位置设置调整
  },
};
