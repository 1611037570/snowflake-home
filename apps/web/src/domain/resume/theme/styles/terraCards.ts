import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "暖陶卡片", // 主题显示名称
  id: "terraCards" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "暖米色个人信息卡与双栏正文卡片，陶色标题和细线组织内容。", // 主题说明
  decisions: { // 主题固定版式与个人信息内容
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏，栏间只使用公共间距
  },
  ui: { // 主题默认界面配置
    font: { color: "#4A4541" }, // 正文文字颜色
    theme: { // 主题配色与标题样式
      userTemplate: "terraCardsUser", // 个人信息组件编号
      color: "#BC6A48", // 陶色强调色
      titleTemplate: "terraCardRule", // 卡片内右延细线标题
    },
    page: { // 页面留白与模块间距
      padding: { vertical: 30, horizontal: 30 }, // 上下与左右页边距
      spacing: { module: 24 }, // 卡片之间的垂直间距
    },
    layout: { // 双栏宽度与模块默认位置
      leftColumnWidth: 31, // 左栏占可用栏宽的百分比
      columns: { // 左右栏模块顺序
        left: ["skill", "account", "honor"], // 左栏放技能与补充资料
        right: ["advantage", "work", "project"], // 右栏放个人总结与经历
      },
    },
    user: { // 个人信息展示方式
      avatarPosition: "left", // 头像位于姓名左侧
      infoPosition: "left", // 姓名左对齐
      infoMode: "none", // 联系方式只显示字段值
    },
  },
} satisfies ThemeTemplateConfig;
