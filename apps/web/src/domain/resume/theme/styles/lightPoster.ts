import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "浅色海报", // 主题显示名称
  id: "lightPoster" as const, // 主题与页眉外观的匹配编号
  design: ["single-column", "polished", "recommended"], // 保留单栏与精美归属，同时进入推荐。
  description: "暖粉浅底页眉、醒目姓名与右侧头像，正文沿用细线标题。", // 主题说明
  decisions: { // 固定页面版式与页眉范围
    layoutType: "topUserSingleColumn", // 个人信息置顶，正文单栏
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        fillsPageTop: true, // 浅色页眉覆盖纸张顶边
        inset: { // 页眉内部留白，单位像素
          top: 33, // 姓名上侧留白
          right: 0, // 右侧沿用页面边距
          bottom: 39, // 姓名下侧留白
          left: 0, // 左侧沿用页面边距
        },
      },
    },
  },
  ui: { // 主题默认界面参数
    theme: { // 暖色配色与公共标题选择
      color: "#A74D45", // 陶红主题色
      titleTemplate: "trailingRule", // 复用现有右延细线标题
    },
    page: { // 纸张与内容留白
      background: "#FFFBF7", // 暖白正文底色
      padding: { vertical: 24 /* 上下页边距 */, horizontal: 42 /* 左右页边距 */ }, // 公共页面边距
      spacing: { module: 24 /* 模块间距 */, paragraph: 12 /* 条目间距 */ }, // 正文内容间距
    },
    font: { // 正文排版
      size: 14, // 正文字号
      lineHeight: 1.55, // 正文行高倍数
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 有头像时置于页眉右侧
      infoPosition: "left", // 姓名和资料左对齐
      infoMode: "none", // 联系资料只展示字段值
      infoLayout: "flex", // 联系资料随宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
