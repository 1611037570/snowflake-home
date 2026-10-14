import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "彩点便签", // 主题显示名称
  id: "colorDotNotes" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "姓名便签、求职方向与资料通栏置顶，点阵纸纹和蓝绿分栏标题组成活泼的双栏简历。", // 主题说明
  pageAppearance: { // 页面正文外观
    textColor: "#243149", // 深蓝灰正文颜色
  },
  decisions: { // 固定版式与装饰能力
    layoutType: "topUserTwoColumn", // 个人信息通栏置顶，正文左右双栏
  },
  ui: { // 用户可调参数的主题默认值
    theme: { // 标题与主题色
      userTemplate: "colorDotNotesUser", // 个人信息组件编号
      color: "#75CF79", // 右栏标题的绿色
      titleTemplate: "colorDotNotesTitle", // 蓝绿便签标题样式
      titleIconMode: "none", // 标题只显示文字
    },
    page: { // 纸张与间距
      background: "#FFFFFF", // 白色点阵纸张
      padding: { // 页面四周留白
        vertical: 30, // 上下页边距
        horizontal: 36, // 左右页边距
      },
      spacing: { // 正文纵向留白
        module: 24, // 模块之间的间距
        paragraph: 12, // 条目之间的间距
      },
    },
    font: { // 正文排版
      size: 14, // 正文字号
      lineHeight: 1.55, // 正文行高
    },
    layout: { // 双栏比例与默认模块位置
      leftColumnWidth: 32, // 左栏占可用宽度的百分比
      columns: { // 栏内默认模块顺序
        left: ["skill", "education", "account"], // 技能与教育在左
        right: ["advantage", "work", "project"], // 介绍与经历在右
      },
    },
    user: { // 个人资料展示方式
      infoMode: "icon", // 置顶资料展示现有字段图标
      infoLayout: "flex", // 联系方式按可用宽度换行
      infoPosition: "left", // 资料靠左对齐
      avatarPosition: "right", // 头像有数据时展示在资料右侧
    },
  },
} satisfies ThemeTemplateConfig;
