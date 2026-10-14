import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "靛蓝圆弧", // 主题显示名称
  id: "indigoOrbit" as const, // 主题与页眉外观的匹配编号
  design: ["single-column", "polished"], // 单栏与精致分类
  description: "靛蓝通栏页眉搭配浅紫圆形装饰，正文使用简洁的短线标题。", // 主题说明
  decisions: { // 固定版式与页眉范围
    layoutType: "topUserSingleColumn", // 个人信息置顶，正文单栏
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        fillsPageTop: true, // 页眉背景覆盖纸张顶边
        inset: { // 页眉内部留白，单位像素
          top: 75, // 为装饰标签和姓名预留上侧空间
          right: 0, // 右侧沿用公共页面边距
          bottom: 30, // 下侧装饰留白
          left: 0, // 左侧沿用公共页面边距
        },
      },
    },
  },
  ui: { // 主题默认界面参数
    theme: { // 主题配色与公共标题选择
      color: "#35477D", // 靛蓝主题色
      titleTemplate: "shortUnderline", // 复用现有短下划线标题
    },
    page: { // 页面底色与留白
      background: "#FFFFFF", // 正文使用白色纸张
      padding: { vertical: 21 /* 页面上下留白 */, horizontal: 48 /* 页面左右留白 */ }, // 公共页面边距
      spacing: { module: 21 /* 模块间距 */, paragraph: 12 /* 段落间距 */ }, // 正文内容间距
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 有头像时放在页眉右侧
      infoPosition: "left", // 姓名与资料左对齐
      infoMode: "none", // 联系资料只展示字段值
      infoLayout: "flex", // 联系资料随宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
