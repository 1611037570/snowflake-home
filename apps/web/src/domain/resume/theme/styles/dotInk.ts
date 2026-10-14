import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "墨点履历", // 主题显示名称
  id: "dotInk" as const, // 主题编号，各外观组件按此编号查找
  design: ["single-column", "timeline", "polished"], // 模板列表分类标签：单栏、时间轴、精致
  description: "浅底个人信息通栏下接渐淡墨线时间轴，实心圆节点串起每段经历。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    usesDateRail: true, // 经历使用固定日期栏
    layoutType: "topUserSingleColumn", // 个人信息顶部通栏、正文单栏
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        inset: { // 区域四周装饰内边距
          top: 0, // 上侧不留装饰内边距，由页边距提供
          right: 0, // 右侧装饰内边距
          bottom: 12, // 底纹与正文之间的装饰留白
          left: 0, // 左侧装饰内边距
        },
        fillsPageTop: true, // 浅底纹覆盖纸张顶边
      },
    },
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题配色
      color: "#2F6F6B", // 墨绿青节点与标题色
      titleTemplate: "timelineIndent", // 模块标题样式：时间轴缩进
    },
    page: { // 纸张与留白设置
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 36, horizontal: 40 }, // 页面四周留白，左侧余量给日期栏
      spacing: { module: 24, paragraph: 12 }, // 模块间距与段落间距
    },
    font: { // 文字尺寸与行距
      size: 14, // 正文字号
      lineHeight: 1.55, // 正文行高倍数
    },
    content: { // 经历条目排版
      dateStyle: "dot", // 日期用「2026.9」形式，适配较窄的日期栏
    },
    user: { // 个人信息默认展示
      avatarPosition: "right", // 头像默认靠右
      infoPosition: "left", // 姓名与资料靠左
      infoMode: "icon", // 联系方式显示图标
      infoLayout: "flex", // 资料随可用宽度换行
    },
  },
} satisfies ThemeTemplateConfig;
