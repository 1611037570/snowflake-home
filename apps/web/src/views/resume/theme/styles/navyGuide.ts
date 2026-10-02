export default {
  name: "蓝线简历", // 主题显示名称
  id: "navyGuide", // 主题编号，供各外观组件按编号选择
  design: ["single-column", "polished"], // 模板列表的分类标签
  description: "深色页眉搭配蓝色纵向引导线，突出个人信息和经历层次。", // 主题说明
  ui: {
    theme: {
      color: "#7C8CF4", // 色带端块、头像衬边和正文标记使用的主题色
      titleIconMode: "none", // 标题使用主题自身的竖条标记
    },
    page: {
      radius: 0, // 纸张使用平直页角
      padding: { vertical: 24, horizontal: 48 }, // 页面上下与左右留白
    },
    user: {
      avatarPosition: "left", // 头像位于个人信息左侧
      infoPosition: "left", // 姓名及资料左对齐
      infoMode: "icon", // 联系方式展示图标
      infoLayout: "flex", // 个人资料按可用宽度自然换行
    },
    layout: {
      type: "topUserSingleColumn", // 个人信息顶部通栏，正文单栏
    },
  },
};
