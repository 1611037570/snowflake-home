export default {
  /** 主题展示名称 */
  name: "荧光网格",
  /** 主题与标题组件的匹配标识 */
  id: "markerGrid",
  /** 主题筛选分类 */
  design: ["single-column", "polished"],
  /** 主题样式说明 */
  description: "浅灰虚线网格铺满页面，荧光笔刷底纹突出模块标题。",
  /** 页面与标题的外观配置 */
  ui: {
    /** 页面背景设置 */
    page: {
      /** 整页平铺的背景纹理类型 */
      backgroundPattern: "dashedGrid",
    },
    /** 标题底纹主题设置 */
    theme: {
      /** 标题笔刷底纹使用荧光绿 */
      color: "#BEFF38",
      /** 默认隐藏标题图标 */
      titleIconMode: "none",
    },
  },
};
