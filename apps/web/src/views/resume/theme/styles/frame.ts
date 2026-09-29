// 白色正文容器的内边距，分页测量和实际渲染共用。
export const FRAME_VIEW_PADDING = 12;

export default {
  name: "红色边框", // 主题显示名称
  id: "frame", // 主题编号
  description: "红色页面背景与白色正文容器。", // 主题说明
  ui: { // 主题相对默认配置的差异
    theme: { // 主题元素配置
      color: "#B5093B", // 标题等元素使用的主题色
    },
    page: { // 页面外观配置
      background: "#B5093B", // 页面红色背景
      padding: { // 页面四周留白
        vertical: 42, // 页面上下留白
        horizontal: 42, // 页面左右留白
      },
    },
    layout: { // 页面区域布局
      type: "topUserSingleColumn", // 个人信息通栏、正文单栏的布局编号
    },
  },
};
