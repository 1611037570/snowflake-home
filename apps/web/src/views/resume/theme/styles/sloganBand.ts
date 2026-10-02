export default {
  name: "标语通栏", // 主题显示名称
  id: "sloganBand", // 主题编号
  design: ["single-column", "polished"], // 模板页的分类筛选标签
  description: "顶部标语色带搭配飘带底沿，适合突出个人主张的通用简历。", // 主题说明
  ui: {
    // 主题相对默认配置的差异
    theme: {
      color: "#0F766E", // 主题色：同时作为标语色带底色
    },
    font: { size: 15, lineHeight: 1.3 }, // 字号与行高
    page: {
      padding: { vertical: 24, horizontal: 24 }, // 页面上下与左右留白
      spacing: { module: 18 }, // 模块间距，同时决定色带与下文之间的白边
    },
    layout: { type: "topUserSingleColumn" }, // 标语与个人信息各自独占通栏区域
  },
};
