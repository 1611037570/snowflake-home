<script setup>
import nnLogo from '@/assets/images/userLogo.png'
import { useThemeStore } from '@/stores'
import Music from '../components/music.vue'
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
const opacity = ref(0)
const backTop = computed(() => {
  return scrollTop.value > solidThreshold
})
const bgColor = computed(() => {
  const rgbColor = theme.value === 'dark' ? '0, 0, 0' : '255, 255, 255'
  return `rgba(${rgbColor}, ${opacity.value})`
})
const customClass = computed(() => {
  return backTop.value ? 'header' : ''
})
// 滚动事件处理
const { height } = useWindowSize()
const solidThreshold = 800
const scrollTop = inject('scrollTop')
watch(scrollTop, (newValue) => {
  if (newValue < height.value) {
    opacity.value = 0
    return
  }
  // 计算透明度
  const currentOpacity = Math.min(newValue - height.value / solidThreshold, 0.8)
  opacity.value = currentOpacity
})
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 box-border w-full px-1 text-2xl text-sf"
    :style="{ backgroundColor: bgColor }"
    :class="[customClass, $s(20, 'h')]"
    style="transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  >
    <div
      class="mx-auto flex h-full max-w-[1200px] items-center justify-between"
      :class="$s(7, 'px')"
    >
      <div class="text-shadow text-yyqx flex items-center font-bold text-sf-base" :class="$s(9)">
        <SfImg :src="nnLogo" class="h-10 w-10 md:h-20 md:w-20" />
        <!-- {{ userInfo.name }} -->
      </div>

      <div class="flex-c h-full" :class="$s(6, 'gap')">
        <div :class="$s(13, 'h')" class="flex items-center gap-4">
          <div
            class="nav-link flex-c text-sf-base"
            style="font-weight: 500"
            :class="[$s(13, 'h'), $s(6)]"
            :key="item.href"
            v-for="item in navList"
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
  border-bottom: 0.5px solid var(--sf-border-base);
}
</style>
