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
]);
