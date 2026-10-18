import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "紧凑年表", // 主题显示名称
  id: "compactTimeline" as const, // 主题与时间轴外观的匹配编号
  design: ["single-column", "timeline", "minimal"], // 单栏、时间轴与简约分类
  description: "紧凑行距与细轴线并排展示日期和经历，适合内容较多的简历。", // 主题说明
  decisions: { // 固定版式与日期栏能力
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    layoutType: "topUserSingleColumn", // 个人信息置顶，正文单栏
    usesDateRail: true, // 经历日期使用公共固定栏
    regions: { // 个人信息与年表之间的装饰留白
      user: { // 个人信息区域
        inset: { top: 0 /* 顶部沿用页边距 */, right: 0 /* 右侧沿用页边距 */, bottom: 18 /* 页眉与年表间距 */, left: 0 /* 左侧沿用页边距 */ }, // 四周装饰内边距
      },
    },
  },
  ui: { // 主题默认界面参数
    theme: { // 年表配色与公共标题选择
      color: "#596A55", // 灰绿色轴线与标题色
      titleTemplate: "timelineIndent", // 复用现有时间轴缩进标题
    },
    page: { // 纸张与紧凑留白
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 30 /* 上下页边距 */, horizontal: 42 /* 左右页边距 */ }, // 公共页面边距
      spacing: { module: 15 /* 模块间距 */, paragraph: 6 /* 条目间距 */ }, // 紧凑的正文间距
    },
    font: { // 正文排版
      size: 13, // 紧凑正文字号
      lineHeight: 1.45, // 紧凑正文行高
    },
    content: { // 日期展示格式
      dateStyle: "dot", // 窄日期栏使用点分隔年月
    },
    user: { // 个人信息默认排列
      avatarPosition: "right", // 有头像时置于右侧
      infoPosition: "left", // 姓名和资料左对齐
      infoMode: "none", // 联系资料只展示字段值
      infoLayout: "flex", // 联系资料随宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
