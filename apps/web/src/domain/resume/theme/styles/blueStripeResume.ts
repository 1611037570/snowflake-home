import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "蓝纹履历", // 主题显示名称
  id: "blueStripeResume" as const, // 主题编号
  design: ["single-column", "polished"], // 单栏与精致分类
  description: "英文页眉、浅蓝斜纹标题与细线条目组成清爽的单栏简历。", // 主题说明
  decisions: { // 主题固定版式与组件
    layoutType: "topUserSingleColumn", // 个人信息通栏置顶，正文单栏
    topDecoration: "blueStripeResume", // 首页英文页眉
    regions: { // 区域装饰空间
      user: { // 个人信息区域
        inset: { // 四周留白，单位像素
          top: 0, // 顶部沿用公共页边距
          right: 0, // 右侧沿用公共页边距
          bottom: 24, // 与正文之间的留白
          left: 0, // 左侧沿用公共页边距
        },
      },
    },
  },
  ui: { // 用户可调参数的主题默认值
    theme: { // 主题配色与标题样式
      color: "#78B8D3", // 浅蓝强调色
      titleTemplate: "diagonalStripeBar", // 斜角纹带标题
    },
    page: { // 页面底色、边距与间距
      background: "#FFFFFF", // 白色纸张
      padding: { // 页面边距
        vertical: 24, // 上下页边距
        horizontal: 36, // 左右页边距
      },
      spacing: { // 内容间距
        module: 21, // 模块间距
        paragraph: 9, // 段落间距
      },
    },
    font: { // 正文字体设置
      size: 15, // 正文字号
      lineHeight: 1.45, // 正文行高倍数
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 头像靠右
      infoPosition: "left", // 姓名与资料靠左
      infoMode: "none", // 联系资料只展示值
      infoLayout: "flex", // 联系资料随可用宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
