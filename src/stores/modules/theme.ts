import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    // 主题模式：light | dark | system
    const themeMode = ref<'light' | 'dark' | 'system'>('system')
    const theme = ref<'light' | 'dark'>('light')
    // 保存媒体查询对象引用，用于后续移除监听（核心修复点1）
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

    // 应用主题到DOM
    const applyTheme = (mode: 'light' | 'dark') => {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(mode)
      theme.value = mode
    }

    // 获取并应用系统主题
    const applySystemTheme = () => {
      const isDark = mediaQueryList.matches
      console.log('isDark', isDark)

      applyTheme(isDark ? 'dark' : 'light')
    }

    // 切换主题模式
    const setTheme = (mode: 'light' | 'dark' | 'system') => {
      console.log('切换主题模式 → 新模式：', mode)
      themeMode.value = mode

      // 先移除之前的系统主题监听（核心修复点2：避免重复监听）
      mediaQueryList.removeEventListener('change', applySystemTheme)

      if (mode === 'system') {
        // 跟随系统主题
        // 给媒体查询对象添加监听（而非window）
        mediaQueryList.addEventListener('change', applySystemTheme)
        applySystemTheme()
      } else {
        // 手动设置主题
        applyTheme(mode)
      }
    }

    // 初始化主题
    const initTheme = () => {
      console.log('初始化主题 → 当前模式：', themeMode.value)
      setTheme(themeMode.value)
    }

    return { themeMode, theme, setTheme, initTheme }
  },
  {
    persist: { storage: localStorage, pick: ['themeMode'] },
  },
)
