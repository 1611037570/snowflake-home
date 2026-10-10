import type { ThemeTemplateConfig } from "./createThemeTemplate";

export default {
  name: "学术",
  id: "academic" as const, // 主题编号
  design: ["single-column", "polished"],
  description: "强调研究经历与文字内容的学术简历样式。",
  decisions: { // 主题固定尺寸与内容契约
    regions: { // 区域装饰尺寸
      main: { // 正文区域
        columns: { // 按语义栏位声明装饰空间
          left: { // 左栏装饰内边距
            left: 30, // 左侧装饰内边距
            right: 0, // 右侧装饰内边距
          },
          right: { // 右栏装饰内边距
            left: 30, // 左侧装饰内边距
            right: 0, // 右侧装饰内边距
          },
        },
      },
    },
  },
  ui: {
    theme: { color: "#0F766E" },
    font: { size: 15, lineHeight: 1.4 },
    content: { textAlign: "justify", dateStyle: "cn" },
  },
} satisfies ThemeTemplateConfig;
