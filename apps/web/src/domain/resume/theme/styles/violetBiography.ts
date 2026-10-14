import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "紫色履历", // 主题显示名称
  id: "violetBiography" as const, // 主题编号，供外观组件按编号选择
  design: ["two-column", "premium"], // 模板列表的分类标签
  description: "紫色个人信息页眉与双栏正文，完整展示个人资料和工作经历。", // 主题说明
  // 页面级外观只控制正文底板轮廓；文字颜色由字体预设提供。
  pageAppearance: {
    openBottomBorder: true, // 正文容器自带圆角，预览只保留顶部与两侧轮廓线
  },
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        columnDecoration: true, // 栏间分隔线占据中缝，留白保留在栏内
        joinsPrevious: true, // 正文底板紧贴个人信息区域
        inset: { // 区域四周装饰内边距
          top: 24, // 上侧装饰内边距
          right: 24, // 右侧装饰内边距
          bottom: 24, // 下侧装饰内边距
          left: 24, // 左侧装饰内边距
        },
      },
    },
    restrictions: { // 主题固定的用户设置
      "user.avatarPosition": "themeFixedAvatarPosition", // 固定头像位置
      "page.background": "themeFixedPageBackground", // 固定页面背景
    },
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
  },
  ui: {
    font: { color: "#000000" }, // 正文文字固定黑色，避免按紫色纸张底色误判为白色
    theme: {
      userTemplate: "violetBiographyUser", // 个人信息组件编号
      color: "#BD55D9", // 标题菱形与栏间分割线颜色
      titleTemplate: "diamondPrefix", // 模块标题样式：菱形前缀
    },
    page: {
      background: "#A950DF", // 纸张底色承接正文圆角与页面边距露出的区域
    },
    layout: {
      leftColumnWidth: 40, // 左侧资料栏占比
      columns: {
        left: ["education", "account"], // 左栏模块顺序
        right: ["work", "advantage"], // 右栏模块顺序
      },
    },
  },
} satisfies ThemeTemplateConfig;
