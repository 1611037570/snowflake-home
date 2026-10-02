export default {
  name: "绛红双栏", // 主题显示名称
  id: "burgundySidebar", // 主题编号
  design: ["two-column", "polished"], // 模板页分类标签
  description: "绛红装饰带搭配浅色侧栏，突出个人信息与工作经历。", // 主题说明
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题图标设置
      color: "#9C2342", // 标语色带与标题装饰使用的主题色
      titleIconMode: "none", // 标题只展示文字与主题装饰
    },
    layout: {
      type: "twoColumn", // 布局类型：个人信息与侧栏模块位于左栏
      columns: {
        left: ["user", "account", "honor", "skill", "advantage"], // 左栏优先展示个人信息、社交账号与证书等模块
        right: [], // 其余已有模块由布局解析器按默认顺序补入右栏
      },
    },
    user: { avatarPosition: "left" }, // 个人信息设置：头像默认靠左展示
  },
};
