import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "绛红双栏", // 主题显示名称
  id: "burgundySidebar" as const, // 主题编号
  design: ["two-column", "polished"], // 模板页分类标签
  description: "绛红装饰带搭配浅色侧栏，突出个人信息与工作经历。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    topDecoration: "burgundySidebar", // 首页顶部独立装饰带
    layoutType: "twoColumn", // 布局类型：个人信息与侧栏模块位于左栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色设置
      color: "#9C2342", // 标语色带与标题装饰使用的主题色
      titleTemplate: "diamondTrail", // 模块标题样式：菱形尾饰
    },
    layout: {
      columns: {
        left: ["user", "account", "honor", "skill", "advantage"], // 左栏优先展示个人信息、社交账号与证书等模块
        right: [], // 其余已有模块由布局解析器按默认顺序补入右栏
      },
    },
    user: { avatarPosition: "center", infoPosition: "center" }, // 侧栏头像、姓名与资料默认居中
  },
} satisfies ThemeTemplateConfig;
