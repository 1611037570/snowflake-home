export default {
  name: "紫色履历", // 主题显示名称
  id: "violetBiography", // 主题编号，供外观组件按编号选择
  design: ["two-column", "polished"], // 模板列表的分类标签
  description: "紫色个人信息页眉与双栏正文，完整展示个人资料和工作经历。", // 主题说明
  // 页面级外观：纸张是紫色而正文底板是浅色，预览由公共页面读取这两条声明
  pageAppearance: {
    textColor: "#000000", // 正文文字固定黑色，避免按紫色纸张底色误判为白色
    openBottomBorder: true, // 正文容器自带圆角，预览只保留顶部与两侧轮廓线
  },
  ui: {
    theme: {
      color: "#BD55D9", // 标题菱形与栏间分割线颜色
      titleIconMode: "none", // 标题装饰由主题组件绘制
    },
    page: {
      background: "#A950DF", // 纸张底色承接正文圆角与页面边距露出的区域
      radius: 0, // 页面边角由正文容器单独绘制
      padding: { vertical: 0, horizontal: 0 }, // 通栏页眉与正文占满纸张宽度
    },
    layout: {
      type: "topUserTwoColumn", // 个人信息通栏、正文双栏
      leftColumnWidth: 40, // 左侧资料栏占比
      columns: {
        left: ["education", "account"], // 左栏模块顺序
        right: ["work", "advantage"], // 右栏模块顺序
      },
    },
  },
};
