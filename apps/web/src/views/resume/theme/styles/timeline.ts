export default {
  name: "时间轴", // 主题显示名称
  id: "timeline", // 主题编号
  description: "顶部个人信息通栏，经历日期沿左侧时间轴排列。", // 主题说明
  ui: { // 主题相对默认配置的差异
    theme: { // 主题元素配置
      color: "#35424D", // 标题和时间轴使用的主题色
    },
    layout: { // 页面区域布局
      type: "topUserSingleColumn", // 个人信息通栏、正文单栏的布局编号
    },
  },
};
