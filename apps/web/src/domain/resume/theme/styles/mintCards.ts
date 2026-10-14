import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "薄荷卡片", // 主题显示名称
  id: "mintCards" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "青绿渐变圆角页眉、浅薄荷纸张和分列的白色卡片。", // 主题说明
  decisions: { // 固定版式与页眉范围
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
    regions: { // 区域装饰能力
      user: { // 个人信息区域
        fillsPageTop: true, // 页眉背景覆盖纸张顶边
      },
    },
  },
  ui: { // 主题默认界面配置
    theme: { // 配色和标题组件
      color: "#13AF9E", // 青绿色强调色
      titleTemplate: "mintHaloTitle", // 薄荷圆点标题
      titleIconMode: "none", // 标题圆点代替模块图标
    },
    page: { // 纸张与留白
      background: "#EFFCF9", // 浅薄荷纸张底色
      padding: { // 页面内边距
        vertical: 36, // 上下留白
        horizontal: 30, // 左右留白
      },
      spacing: { // 正文间距
        module: 24, // 个人信息与正文、正文卡片间沿用公共间距
        paragraph: 12, // 条目段落间距
      },
    },
    font: { // 正文字体设置
      color: "#000000", // 浅色纸张上的正文固定使用黑色
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高
    },
    layout: { // 双栏比例与模块顺序
      leftColumnWidth: 50, // 左栏占一半可用宽度
      columns: { // 模块默认分栏
        left: ["advantage", "work", "project"], // 左栏展示简介与经历
        right: ["skill", "education", "honor", "account"], // 右栏展示技能与补充资料
      },
    },
  },
} satisfies ThemeTemplateConfig;
