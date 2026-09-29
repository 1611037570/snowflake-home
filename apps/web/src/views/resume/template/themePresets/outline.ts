export default {
  name: "线框",
  id: "outline",
  description: "以纯黑细线勾勒模块外边框的线框简历样式。",
  ui: {
    theme: { color: "#000000" },
    font: { titleSize: 18 },
    page: { spacing: { module: 48 } },
    content: { dateStyle: "cn" },
  },
  appearance: {
    moduleTitle: "outline",
    moduleFrame: "outline" as const,
    item: { padding: 12 },
  },
};
