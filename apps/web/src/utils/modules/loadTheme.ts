// 直接引用主题 store 模块，绕过 @/stores 桶文件以免拉入全部业务 store
import { useThemeStore } from "@/stores/modules/theme";
export function loadTheme() {
  useThemeStore().initTheme();
}
