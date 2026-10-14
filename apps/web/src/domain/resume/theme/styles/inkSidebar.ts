import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "墨蓝侧栏", // 主题显示名称
  id: "inkSidebar" as const, // 主题编号，供外观组件按编号选择
  design: ["two-column", "polished"], // 模板列表分类标签：双栏、精美
  description: "首页墨蓝色带搭配淡墨资料侧栏，标题落在实色块上。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    topDecoration: "inkSidebar", // 首页顶部独立装饰组件编号
    pageBorder: { // 主题固定纸张边框
      width: 1, // 边框宽度，单位像素
      color: "#D8DEE6", // 边框颜色
    },
    layoutType: "twoColumn", // 个人信息位于左栏的双栏布局
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#16324F", // 主题色：侧栏淡底、左缘竖条与标题色块
      titleTemplate: "solidLabelTrail", // 模块标题样式：色块引线
    },
    layout: { // 双栏布局设置
      leftColumnWidth: 38, // 左栏占可用栏宽的百分比
      columns: { // 左右栏的默认模块顺序
        left: ["user", "account", "skill", "advantage"], // 左栏展示个人信息、社交账号、技能与个人优势
        right: [], // 其余已有模块由布局解析器按默认顺序补入右栏
      },
    },
    page: { // 页面留白设置
      padding: { vertical: 30, horizontal: 30 }, // 页面上下与左右留白
    },
    user: { // 个人信息默认排列
      avatarPosition: "center", // 头像默认居中
      infoPosition: "center", // 姓名与资料默认居中
      infoMode: "icon", // 联系方式默认显示图标
    },
  },
} satisfies ThemeTemplateConfig;
