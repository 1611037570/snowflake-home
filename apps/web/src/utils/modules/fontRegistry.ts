import { registerFonts } from "./fontLoader";

// 内置字体注册表：默认字体不需要动态加载，扩展字体按需导入样式
registerFonts([
  {
    key: "text-puhui",
    family: "AlibabaPuHuiTi-3-55-Regular",
  },
  {
    key: "text-yyqx",
    family: "yyqx",
    load: () => import("../../styles/fonts/yyqx.scss"),
  },
  {
    key: "text-source-han-serif",
    family: "SourceHanSerifCN",
    load: () => import("../../styles/fonts/sourceHanSerif.scss"),
  },
  {
    key: "text-source-han-sans",
    family: "SourceHanSansCN",
    load: () => import("../../styles/fonts/sourceHanSans.scss"),
  },
  {
    key: "text-lxgw-neo-xihei",
    family: "LXGWNeoXiHei",
    load: () => import("../../styles/fonts/lxgwNeoXiHei.scss"),
  },
  {
    key: "text-lxgw-wenkai-lite",
    family: "LXGW WenKai Lite",
    load: () => import("../../styles/fonts/lxgwWenKaiLite.scss"),
  },
  {
    key: "text-inter",
    family: "Inter",
    load: () => import("../../styles/fonts/inter.scss"),
  },
  {
    key: "text-eb-garamond",
    family: "EB Garamond",
    load: () => import("../../styles/fonts/ebGaramond.scss"),
  },
]);
