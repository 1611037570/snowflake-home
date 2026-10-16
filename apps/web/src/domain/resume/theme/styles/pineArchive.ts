import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "松墨档案", // 主题显示名称
  id: "pineArchive" as const, // 主题编号
  design: ["single-column", "polished", "recommended"], // 保留单栏与精美归属，同时进入推荐。
  description: "松绿色几何页眉、浅色个人信息底板与色块引线标题。", // 主题说明
  decisions: { // 主题固定版式与装饰能力
    layoutType: "topUserSingleColumn", // 个人信息通栏置顶，正文单栏
    topDecoration: "pineArchive", // 首页几何装饰组件
    regions: { // 区域装饰空间
      user: { // 个人信息区域
        inset: { // 底板内部留白，单位像素
          top: 24, // 顶部留白
          right: 28, // 右侧留白
          bottom: 24, // 底部留白
          left: 28, // 左侧留白
        },
      },
    },
  },
  ui: { // 用户可调参数的主题默认值
    theme: { // 主题配色与标题样式
      color: "#28594F", // 松绿色主题色
      titleTemplate: "solidLabelTrail", // 色块引线标题
    },
    page: { // 页面底色、边距与间距
      background: "#FCFAF7", // 暖白纸张底色
      padding: { vertical: 36, horizontal: 42 }, // 页面上下与左右边距
      spacing: { module: 18 }, // 模块之间的间距
    },
    font: { // 正文字体与标题字号
      size: 15, // 正文字号
      titleSize: 18, // 模块标题字号
      lineHeight: 1.4, // 正文行高倍数
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 头像置右
      infoPosition: "left", // 文字靠左
      infoMode: "text", // 联系方式显示文字
      infoLayout: "flex", // 联系方式随宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
