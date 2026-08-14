import { useThemeStore } from '@/stores'
export function loadTheme() {
  useThemeStore().initTheme()
}
