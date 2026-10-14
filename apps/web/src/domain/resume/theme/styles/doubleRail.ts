import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "墨阶", // 主题显示名称
  id: "doubleRail" as const, // 主题编号，各外观组件按此编号查找
  design: ["single-column", "timeline", "polished"], // 模板列表分类标签：单栏、时间轴、精致
  description: "墨黑页眉通栏下接浅色读数列，等宽日期与模块序号沿轴线逐级刻出账簿式阶梯。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    usesDateRail: true, // 经历使用固定日期栏
    layoutType: "topUserSingleColumn", // 个人信息顶部通栏、正文单栏
    regions: { // 区域装饰尺寸
      user: { // 个人信息区域
        inset: { // 区域四周装饰内边距
          top: 0, // 上侧不留装饰内边距，由页边距提供
          right: 0, // 右侧装饰内边距
          bottom: 18, // 页眉色带与正文之间的装饰留白
          left: 0, // 左侧装饰内边距
        },
        fillsPageTop: true, // 墨黑页眉覆盖纸张顶边
      },
      main: { // 正文区域
        joinsPrevious: true, // 正文紧贴页眉，读数列不在页眉下方断开
        inset: { // 区域四周装饰内边距
          top: 26, // 页眉与首个模块之间的留白落在读数列底色内
          right: 0, // 右侧装饰内边距
          bottom: 0, // 底部装饰内边距
          left: 0, // 左侧装饰内边距
        },
      },
    },
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题配色与标题组件
      color: "#B0432B", // 朱红强调色：模块序号、日期、刻度节点与标题描边
      titleTemplate: "doubleRailTitle", // 模块标题样式：墨阶序号
    },
    page: { // 纸张与留白设置
      background: "#FAF9F7", // 暖白纸张
      padding: { vertical: 34, horizontal: 42 }, // 页面四周留白，左侧余量给日期栏
      spacing: { module: 26, paragraph: 12 }, // 模块间距与条目间距
    },
    font: { // 文字尺寸与行距
      color: "#23262B", // 暖白纸张上的深墨正文颜色
      size: 14, // 正文字号
      lineHeight: 1.6, // 正文行高倍数
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
