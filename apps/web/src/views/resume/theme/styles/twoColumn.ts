export default {
  name: "双栏",
  id: "twoColumn",
  design: ["two-column"],
  description: "所有模块固定分到左右两栏，适合内容较多的简历。",
  ui: {
    theme: { color: "#7C3AED" },
    layout: { type: "twoColumn" },
    user: { avatarPosition: "left" }, // 双栏头像默认居左，后续仍可通过头像位置设置调整
  },
};
