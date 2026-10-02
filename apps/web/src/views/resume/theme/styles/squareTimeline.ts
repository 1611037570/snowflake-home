export default {
  name: "方节点时间轴", // 主题显示名称
  id: "squareTimeline", // 主题编号，各外观组件按此编号查找
  design: ["single-column", "timeline"], // 模板列表分类标签
  description: "左侧模块标题与日期，方形节点连接正文时间轴。", // 主题说明
  ui: { // 相对默认界面的配置差异
    theme: { // 主题颜色与标题图标设置
      color: "#6864EF", // 标题、方形节点和时间轴使用的主题色
      titleIconMode: "none", // 标题仅显示文字和主题自身的节点
    },
    font: { // 文字显示设置
      titleSize: 16, // 左侧模块标题字号
      lineHeight: 1.5, // 正文行高，保持经历内容易读
    },
    page: { // 纸张外观与留白
      radius: 0, // 纸张使用平直页角
      padding: { // 页面四周留白
        vertical: 36, // 页面上下留白
        horizontal: 48, // 页面左右留白
      },
    },
    user: { // 个人信息展示设置
      avatarPosition: "right", // 头像默认显示在右侧
      infoPosition: "left", // 姓名与个人资料左对齐
      infoMode: "icon", // 个人资料使用图标标签
      infoLayout: "flex", // 资料按可用宽度自然换行
    },
    layout: { // 页面区域布局
      type: "topUserSingleColumn", // 顶部个人信息通栏，正文保持单栏
    },
  },
};
