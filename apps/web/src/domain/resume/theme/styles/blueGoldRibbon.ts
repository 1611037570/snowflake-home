import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "蓝金双线", // 主题显示名称
  id: "blueGoldRibbon" as const, // 主题编号
  design: ["single-column", "polished"], // 单栏与精致分类
  description: "蓝金双线页眉搭配折角飘带标题与正文左侧引导线。", // 主题说明
  decisions: { // 主题固定版式与装饰
    layoutType: "topUserSingleColumn", // 个人信息通栏置顶
    topDecoration: "blueGoldRibbon", // 首页蓝金页眉
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        inset: { // 四周装饰内边距
          top: 0, // 上侧装饰内边距
          right: 0, // 右侧装饰内边距
          bottom: 0, // 下侧装饰内边距
          left: 24, // 左侧留出引导线所在的装饰空间
        },
      },
    },
  },
  ui: { // 主题默认界面参数
    theme: { // 配色与标题样式
      color: "#469BF0", // 模块标题与引导线的蓝色
      titleTemplate: "foldedRibbon", // 折角飘带标题
    },
    page: { // 页面背景、边距和间距
      background: "#FFFFFF", // 白色纸张
      padding: { // 页面边距
        vertical: 27, // 上下边距
        horizontal: 36, // 左右边距
      },
      spacing: { // 内容间距
        module: 21, // 模块间距
        paragraph: 9, // 段落间距
      },
    },
    font: { // 正文字体
      size: 15, // 正文字号
      lineHeight: 1.45, // 正文行高
    },
    user: { // 个人信息排列
      avatarPosition: "right", // 头像靠右
      infoPosition: "left", // 信息靠左
      infoMode: "text", // 联系信息展示文字
      infoLayout: "grid", // 联系信息按网格排列
    },
  },
} satisfies ThemeTemplateConfig;
