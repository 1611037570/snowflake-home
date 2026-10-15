import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "赤日几何", // 主题显示名称
  id: "crimsonGeometry" as const, // 主题编号
  design: ["single-column", "polished"], // 单栏与精致分类
  description: "赤红通栏页眉、几何圆与三角装饰，搭配深蓝文字和方形标题标记。", // 主题说明
  pageAppearance: { // 页面顶部外观
    bleedsPageTop: true, // 页眉背景铺到纸张顶边
  },
  decisions: { // 固定版式与区域装饰
    layoutType: "topUserSingleColumn", // 个人信息置顶且正文单栏
    regions: { // 区域绘制能力
      user: { // 个人信息页眉区域
        fillsPageTop: true, // 红色背景覆盖纸张顶边
        inset: { // 页眉内容周围的装饰留白
          top: 30, // 顶部装饰留白
          right: 0, // 右侧交由公共页面边距控制
          bottom: 36, // 页眉底部装饰留白
          left: 0, // 左侧交由公共页面边距控制
        },
      },
    },
  },
  ui: { // 主题初始界面参数
    theme: { // 主题色与标题组件
      color: "#E73646", // 赤红主色
      titleTemplate: "crimsonGeometryTitle", // 方形标记标题组件
      titleIconMode: "none", // 标题不额外显示图标
    },
    page: { // 纸张与内容留白
      background: "#F3F4F5", // 浅灰纸张底色
      padding: { // 页面四周留白
        vertical: 24, // 上下页边距
        horizontal: 42, // 左右页边距
      },
      spacing: { // 正文间距
        module: 21, // 模块间距
        paragraph: 9, // 段落间距
      },
    },
    font: { // 正文字体外观
      color: "#173455", // 深蓝正文颜色
      size: 15, // 正文字号
      titleSize: 17, // 模块标题字号
      lineHeight: 1.45, // 正文行高倍数
    },
    user: { // 通用个人信息组件的排列参数
      infoMode: "none", // 联系资料只显示字段值
      infoLayout: "flex", // 联系资料沿页眉横向排列
      infoPosition: "left", // 姓名与资料靠左
      avatarPosition: "right", // 有头像时置于右侧
    },
  },
} satisfies ThemeTemplateConfig;
