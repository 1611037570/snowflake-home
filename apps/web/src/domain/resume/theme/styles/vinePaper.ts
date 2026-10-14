import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "青藤信纸", // 主题显示名称
  id: "vinePaper" as const, // 主题编号
  design: ["two-column", "polished"], // 双栏与精致分类
  description: "暖白纸张、两侧藤线和浅金圆点，个人信息置顶、正文双栏的清雅履历。", // 主题说明
  decisions: { // 固定布局和个人信息展示
    layoutType: "topUserTwoColumn", // 个人信息通栏置顶、正文双栏
    pageBackgroundPattern: "vinePaper", // 纸张两侧的藤线装饰
  },
  ui: { // 用户可调的主题默认值
    theme: { // 主题色和标题样式
      color: "#728F68", // 藤叶绿色
      titleTemplate: "vinePaperTitle", // 圆点细线标题
      titleIconMode: "none", // 标题装饰自身绘制圆点
    },
    page: { // 纸张底色和留白
      background: "#FBF8F3", // 暖白纸张
      padding: { // 页面内边距
        vertical: 24, // 上下留白
        horizontal: 60, // 左右留白避开两侧藤线
      },
      spacing: { // 模块和段落间距
        module: 24, // 模块纵向距离
        paragraph: 9, // 正文段落距离
      },
    },
    font: { // 正文排版
      color: "#3D4A3F", // 正文使用深绿灰色
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高
    },
    layout: { // 双栏默认比例与模块顺序
      leftColumnWidth: 43, // 左栏宽度百分比
      columns: { // 模块默认分栏
        left: ["skill", "education", "account"], // 技能、教育与账号放左栏
        right: ["advantage", "work", "project"], // 简介、经历与项目放右栏
      },
    },
    user: { // 个人资料展示方式
      infoPosition: "left", // 姓名和资料靠左
      infoMode: "text", // 联系资料显示文字标签
      infoLayout: "grid", // 联系资料按两列网格排布
      avatarPosition: "right", // 头像有数据时展示在资料右侧
    },
  },
} satisfies ThemeTemplateConfig;
