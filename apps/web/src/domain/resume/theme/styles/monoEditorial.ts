import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "黑白编辑稿", // 主题显示名称
  id: "monoEditorial" as const, // 主题与页眉外观的匹配编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "黑白大字页眉与宽留白，正文以序号标题呈现清晰层级。", // 主题说明
  decisions: { // 固定页面版式与区域留白
    layoutType: "topUserSingleColumn", // 个人信息置顶，正文单栏
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        inset: { // 页眉内部留白，单位像素
          top: 18, // 顶部细线与内容间距
          right: 0, // 右侧沿用页面边距
          bottom: 24, // 页眉与正文的留白
          left: 0, // 左侧沿用页面边距
        },
      },
    },
  },
  ui: { // 主题默认界面参数
    theme: { // 黑白配色与公共标题选择
      color: "#252525", // 姓名与标题使用近黑色
      titleTemplate: "numberedPrefix", // 复用现有序号前缀标题
    },
    page: { // 纸张与页面留白
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 42 /* 上下页边距 */, horizontal: 48 /* 左右页边距 */ }, // 公共页面边距
      spacing: { module: 30 /* 模块间距 */, paragraph: 12 /* 条目间距 */ }, // 正文内容间距
    },
    font: { // 正文排版
      size: 14, // 正文字号
      lineHeight: 1.65, // 正文行高倍数
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 有头像时置于页眉右侧
      infoPosition: "left", // 姓名和资料左对齐
      infoMode: "none", // 联系资料只展示字段值
      infoLayout: "flex", // 联系资料随页面宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
