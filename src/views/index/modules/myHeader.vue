<script setup>
import nnLogo from '@/assets/images/userLogo.png'
import { useSystemStore, useThemeStore } from '@/stores'
import Music from '../components/music.vue'
const systemStore = useSystemStore()
const { windowSize } = storeToRefs(systemStore)
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const navList = [
  {
    name: '关于',
    href: 'about',
  },
  {
    name: '摄影',
    href: 'shoot',
  },
  {
    name: '项目',
    href: 'project',
  },
]
function togglePlay(href) {
  // 获取目标元素
  const targetElement = document.getElementById(href)
  if (targetElement) {
    // 平滑滚动到目标元素
    targetElement.scrollIntoView({
      behavior: 'smooth', // 平滑滚动
      block: 'start', // 对齐到区块顶部
      duration: 10,
    })
  }
}
const solidThreshold = computed(() => {
  return windowSize.value.height
})
const opacity = ref(0)

const bgColor = computed(() => {
  const rgbColor = theme.value === 'dark' ? '0, 0, 0' : '255, 255, 255'
  return `rgba(${rgbColor}, ${opacity.value})`
})
const customClass = computed(() => {
  return scrollTop.value > solidThreshold.value + 160 ? 'header' : ''
})
// 滚动事件处理
const scrollTop = inject('scrollTop')
watch(scrollTop, (newValue) => {
  if (newValue < solidThreshold.value) {
    opacity.value = 0
    return
  }
  // 计算透明度：滚动超过阈值后，根据滚动距离逐渐增加透明度，最大0.8
  const scrollOffset = newValue - solidThreshold.value
  const currentOpacity = Math.min(scrollOffset / 400, 0.8)
  opacity.value = currentOpacity
})
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 box-border h-20 w-full px-2 text-2xl text-sf"
    :style="{ backgroundColor: bgColor }"
    :class="[customClass]"
    style="
      transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 0.5px solid none;
    "
  >
    <div class="mx-auto flex h-full max-w-[1200px] items-center justify-between">
      <div class="text-shadow text-yyqx flex items-center font-bold text-sf-base">
        <SfImg :src="nnLogo" class="h-15 w-15 md:h-20 md:w-20" />
      </div>
      <div class="flex-c h-full gap-5">
        <div class="flex h-full items-center gap-4">
          <div
            class="nav-link flex-c cursor-pointer py-2 text-base text-sf-base md:text-xl"
            v-for="item in navList"
            :key="item.href"
            style="font-weight: 500"
            @click="togglePlay(item.href)"
          >
            {{ item.name }}
          </div>
        </div>
        <SfLocale />
        <Music />
        <SfTheme />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  backdrop-filter: saturate(200%) blur(30px);
  -webkit-backdrop-filter: saturate(200%) blur(30px);
  // box-shadow: var(--sf-border-base) 0 1px 5px;
  border-bottom: 0.5px solid var(--sf-border-base) !important;
}

.nav-link {
  position: relative;
  transition: color 0.3s ease;

  &::after,
  &::active {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: var(--sf-theme);
    transition:
      width 0.3s ease,
      transform 0.3s ease;
    border-radius: 2px;
    transform: translateX(-50%);
  }
}
</style>
