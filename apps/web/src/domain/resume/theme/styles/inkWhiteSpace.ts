import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { DEFAULT_SQUARE_AVATAR_SIZE } from "@/domain/resume/theme/avatar";

export default {
  name: "砚青留白", // 主题显示名称
  id: "inkWhiteSpace" as const, // 主题编号
  design: ["two-column", "premium"], // 双栏与臻品分类
  description: "暖白纸张、右上细圆弧与大幅留白，衬线文字和细底线组织双栏内容。", // 主题说明
  decisions: { // 主题固定版式
    avatarSize: DEFAULT_SQUARE_AVATAR_SIZE, // 主题默认使用统一正方形头像尺寸
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
  },
  ui: { // 主题默认界面配置
    theme: { // 配色与标题
      color: "#91B8AF", // 青灰色装饰线
      titleTemplate: "inkSpacedRuleTitle", // 疏朗衬线细线标题
      titleIconMode: "none", // 标题不显示图标
    },
    page: { // 纸张和留白
      background: "#F6F8F5", // 暖白纸张底色
      padding: { // 页面内边距
        vertical: 90, // 上下大留白
        horizontal: 48, // 左右留白
      },
      spacing: { // 正文间距
        module: 30, // 模块之间的垂直留白
        paragraph: 12, // 条目之间的垂直留白
      },
    },
    font: { // 字体和行距
      color: "#354441", // 暖白纸上的深灰绿色
      family: "text-source-han-serif", // 中文衬线字体
      size: 14, // 正文字号
      titleSize: 19, // 模块标题字号
      lineHeight: 1.75, // 正文行高
    },
    layout: { // 双栏比例与模块顺序
      leftColumnWidth: 35, // 左栏作为资料侧栏
      columns: { // 栏内模块分配
        left: ["account", "education", "skill", "honor"], // 左侧展示补充资料
        right: ["work", "project", "advantage"], // 右侧展示经历与总结
      },
    },
    user: { // 通栏个人信息排版
      avatarPosition: "right", // 头像位于资料右侧
      infoPosition: "left", // 姓名和资料左对齐
      infoMode: "text", // 联系方式保留文字标签
      infoLayout: "flex", // 信息随宽度自动换行
    },
  },
} satisfies ThemeTemplateConfig;
