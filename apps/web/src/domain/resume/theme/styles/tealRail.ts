import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "青线双栏", // 主题显示名称
  id: "tealRail" as const, // 主题编号，供外观组件按编号选择
  design: ["two-column", "timeline"], // 模板列表的分类标签
  description: "左侧个人资料与右侧经历以青色竖线和节点连接。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        columns: { // 按语义栏位声明装饰空间
          right: { // 右栏装饰内边距
            left: 48, // 左侧装饰内边距
            right: 0, // 右侧装饰内边距
          },
        },
      },
    },
    userContent: { // 个人信息内容契约
      renderer: "tealRailUser", // 内容组件编号
      split: "blocks", // 整块展示或按稳定块分片
    },
    restrictions: { // 内容组件固定的用户设置
      "user.infoLayout": "themeFixedContactLayout", // 资料固定单列排布
    },
    layoutType: "twoColumn", // 个人信息位于左栏的双栏布局
  },
  ui: {
    theme: {
      color: "#49BDB6", // 竖线与标题节点的主题色
      titleIconMode: "none", // 标题装饰由主题组件绘制
    },
    page: {
      padding: { vertical: 48, horizontal: 48 }, // 页面外侧留白
      spacing: { module: 24 }, // 模块之间的默认距离
    },
    layout: {
      leftColumnWidth: 40, // 左栏所占宽度比例
      columns: {
        left: ["user", "honor", "account", "skill"], // 左栏资料模块顺序
        right: ["work", "advantage"], // 右栏经历模块顺序
      },
    },
    user: {
      avatarPosition: "left", // 头像默认靠左
    },
  },
} satisfies ThemeTemplateConfig;
