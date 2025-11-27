<script setup>
import { useThemeStore } from '@/stores'
import Music from '../components/music.vue'
const themeStore = useThemeStore()
const { themeMode } = storeToRefs(themeStore)
const navList = [
  {
    name: '关于',
    href: 'about',
  },
  {
    name: '作品',
    href: 'work',
  },
  {
    name: '联系我',
    href: 'contact',
  },
]
const opacity = ref(0)
const bgColor = computed(() => {
  const rgbColor = themeMode.value === 'dark' ? '0, 0, 0' : '255, 255, 255'
  return `rgba(${rgbColor}, ${opacity.value})`
})
const customClass = ref('')
// 滚动事件处理
const diff = 100
const handleScroll = () => {
  const scrollPosition = window.scrollY
  if (scrollPosition < diff) {
    bgColor.value = 'transparent'
    customClass.value = ''
    return
  }
  customClass.value = 'header'
  const solidThreshold = 800
  // 计算透明度
  const currentOpacity = Math.min(scrollPosition - diff / solidThreshold, 0.8)
  opacity.value = currentOpacity

  //   // 回到顶部按钮显示/隐藏
  //   showBackToTop.value = scrollPosition > 500

  //   // 触发滚动动画
  //   triggerScrollReveal()
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 初始化时触发一次滚动事件
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
function handleClick(e) {
  e.preventDefault()
  e.stopPropagation()
}
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 box-border flex h-[80px] w-full items-center justify-between px-24"
    :style="{ backgroundColor: bgColor }"
    :class="customClass"
    style="transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  >
    <div
      id="logoText"
      class="text-shadow text-2xl font-bold text-sf-text transition-colors duration-300"
    >
      小羊
    </div>

    <div class="flex-c h-20 gap-8">
      <el-anchor direction="horizontal" class="h-full" :offset="80" @click="handleClick">
        <el-anchor-link :href="`#${item.href}`" v-for="item in navList" :key="item.href">
          <div class="nav-link flex-c h-20 text-lg text-sf-base transition-colors duration-300">
            {{ item.name }}
          </div>
        </el-anchor-link>
      </el-anchor>
      <SfLocale />
      <Music />
      <SfTheme />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  backdrop-filter: saturate(200%) blur(30px);
  -webkit-backdrop-filter: saturate(200%) blur(30px);
  box-shadow: var(--sf-border-base) 0 5px 30px;
}
</style>
