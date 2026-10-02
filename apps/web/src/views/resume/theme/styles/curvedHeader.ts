export default {
  /** 主题展示名称 */
  name: "弧形页眉",
  /** 主题与外观组件的匹配标识 */
  id: "curvedHeader",
  /** 主题筛选分类 */
  design: ["single-column", "polished"],
  /** 主题样式说明 */
  description: "通栏弧形页眉搭配居中圆形头像，姓名与联系方式居中排列。",
  /** 主题外观设置 */
  ui: {
    /** 主题装饰设置 */
    theme: {
      /** 页眉背景主题色 */
      color: "#087F8C",
      /** 各区域的外观设置 */
      region: {
        /** 个人信息区域使用通栏弧形背景 */
        user: "curvedHeader",
      },
    },
    /** 个人信息排版设置 */
    user: {
      /** 头像位于信息区上方居中 */
      avatarPosition: "center",
      /** 姓名与信息内容居中 */
      infoPosition: "center",
      /** 联系方式使用图标标签 */
      infoMode: "icon",
      /** 联系信息按行排列并自动换行 */
      infoLayout: "flex",
    },
    /** 页面布局设置 */
    layout: {
      /** 个人信息独占顶部通栏区域 */
      type: "topUserSingleColumn",
    },
  },
};
