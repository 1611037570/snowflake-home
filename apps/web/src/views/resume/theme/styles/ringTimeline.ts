export default {
  name: "圆环时间轴", // 主题显示名称
  id: "ringTimeline", // 主题编号，各外观组件按此编号查找
  design: ["single-column", "timeline"], // 模板列表分类标签：单栏、时间轴
  description: "顶部个人信息通栏，左侧贯穿时间轴用空心圆环标记每段经历的日期。", // 主题说明
  ui: { // 主题相对默认配置的差异
    theme: { // 主题配色与标题装饰
      color: "#2F5D8A", // 轴线、空心圆环与标题节点使用的靛蓝
      titleIconMode: "none", // 标题只保留节点标记，不叠加图标
    },
    page: { // 纸张与留白设置
      radius: 0, // 平直页角，突出纵向轴线
      padding: { vertical: 36, horizontal: 40 }, // 页面四周留白，左侧余量给时间轴栏
      spacing: { module: 24, paragraph: 12 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与行距
      size: 14, // 正文字号
      titleSize: 17, // 模块标题字号
      lineHeight: 1.55, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "dot", // 日期用「2026.9」形式，适配较窄的日期栏
    },
    layout: { // 页面区域布局
      type: "topUserSingleColumn", // 个人信息顶部通栏、正文单栏
    },
    user: { // 个人信息默认展示
      avatarPosition: "right", // 头像默认靠右
      infoPosition: "left", // 姓名与资料靠左
      infoMode: "icon", // 联系方式显示图标
      infoLayout: "flex", // 资料随可用宽度换行
    },
  },
};
