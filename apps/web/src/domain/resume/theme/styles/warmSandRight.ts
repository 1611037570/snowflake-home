import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "暖沙右栏", // 主题显示名称
  id: "warmSandRight" as const, // 主题与右栏外观的匹配编号
  design: ["two-column", "polished"], // 双栏与精致分类
  description: "暖白正文搭配浅沙色右侧资料栏，以细线和留白组织经历。", // 主题说明
  decisions: { // 主题固定版式
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    regions: { main: { columnDecoration: true } }, // 栏间装饰占据中缝，留白保留在栏内
    layoutType: "twoColumnRightUser", // 个人信息置于右侧窄栏
  },
  ui: { // 主题默认界面参数
    theme: { // 配色与公共标题选择
      color: "#A7774F", // 暖棕强调色
      titleTemplate: "shortUnderline", // 复用现有短下划线标题
    },
    page: { // 纸张与正文留白
      background: "#FFFCF7", // 暖白纸张底色
      padding: { vertical: 36 /* 上下页边距 */, horizontal: 36 /* 左右页边距 */ }, // 公共页面边距
      spacing: { module: 24 /* 模块间距 */, paragraph: 12 /* 条目间距 */ }, // 正文内容间距
    },
    font: { // 正文排版
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高倍数
    },
    layout: { // 左右栏比例与模块顺序
      leftColumnWidth: 65, // 左侧经历栏宽度占比
      columns: { // 两栏模块默认顺序
        left: ["advantage", "work", "internship", "project", "education"], // 左栏展示主要经历
        right: ["user", "skill", "honor", "account"], // 右栏展示个人信息与补充内容
      },
    },
    user: { // 个人信息默认排列
      avatarPosition: "center", // 有头像时置于资料栏顶部
      infoPosition: "center", // 姓名与资料在右栏居中
      infoMode: "none", // 联系资料只显示字段值
      infoLayout: "flex", // 联系资料按窄栏宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
