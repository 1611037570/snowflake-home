import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "紫色履历", // 主题显示名称
  id: "violetBiography" as const, // 主题编号，供外观组件按编号选择
  design: ["two-column", "polished"], // 模板列表的分类标签
  description: "紫色个人信息页眉与双栏正文，完整展示个人资料和工作经历。", // 主题说明
  // 页面级外观：纸张是紫色而正文底板是浅色，预览由公共页面读取这两条声明
  pageAppearance: {
    textColor: "#000000", // 正文文字固定黑色，避免按紫色纸张底色误判为白色
    openBottomBorder: true, // 正文容器自带圆角，预览只保留顶部与两侧轮廓线
  },
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        inset: { // 区域四周装饰内边距
          top: 24, // 上侧装饰内边距
          right: 24, // 右侧装饰内边距
          bottom: 24, // 下侧装饰内边距
          left: 24, // 左侧装饰内边距
        },
      },
    },
    userContent: { // 个人信息内容契约
      renderer: "violetBiographyUser", // 内容组件编号
      split: "whole", // 整块展示或按稳定块分片
    },
    restrictions: { // 主题固定的用户设置
      "user.avatarPosition": "themeFixedAvatarPosition", // 固定头像位置
      "page.background": "themeFixedPageBackground", // 固定页面背景
    },
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
  },
  ui: {
    theme: {
      color: "#BD55D9", // 标题菱形与栏间分割线颜色
      titleIconMode: "none", // 标题装饰由主题组件绘制
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
