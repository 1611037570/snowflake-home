<script setup>
import { useThemeStore } from '@/stores'
import { userInfo } from '@/views/index/data'
import Music from '../components/music.vue'
const themeStore = useThemeStore()
const { themeMode } = storeToRefs(themeStore)
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
console.log(userInfo)
const opacity = ref(0)
const backTop = ref(false)
const bgColor = computed(() => {
  const rgbColor = themeMode.value === 'dark' ? '0, 0, 0' : '255, 255, 255'
  return `rgba(${rgbColor}, ${opacity.value})`
})
const customClass = computed(() => {
  return backTop.value ? 'header' : ''
})
// 滚动事件处理
const diff = 100
const solidThreshold = 800
const handleScroll = () => {
  const scrollPosition = window.scrollY
  if (scrollPosition < diff) {
    opacity.value = 0
    return
  }
  // 计算透明度
  const currentOpacity = Math.min(scrollPosition - diff / solidThreshold, 0.8)
  opacity.value = currentOpacity
  // 回到顶部按钮显示/隐藏
  backTop.value = scrollPosition > solidThreshold
}

useEventListener(window, 'scroll', handleScroll)

function handleClick(e) {
  e.preventDefault()
  e.stopPropagation()
}

const SIZES = {
  base: { offset: 3, min: 3 },
  sm: { offset: 2, min: 4 },
  md: { offset: 1, min: 5 },
  lg: { offset: 0, min: 0 },
}

function sizeConvert(size, type = 'text') {
  const res = Number(size)
  const getSize = (type) => Math.max(res - SIZES[type].offset, SIZES[type].min)
  const baseSize = getSize('base')
  const smSize = getSize('sm')
  const mdSize = getSize('md')
  const lgSize = getSize('lg')
  return `${type}-${baseSize} md:${type}-${mdSize} sm:${type}-${smSize} lg:${type}-${lgSize}
    `
}
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 box-border h-[80px] w-full text-2xl text-sf"
    :style="{ backgroundColor: bgColor }"
    :class="[customClass]"
    style="transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  >
    <div
      class="mx-auto flex h-full max-w-[1200px] items-center justify-between"
      :class="sizeConvert(8, 'px')"
    >
      <div class="text-shadow text-2xl font-bold text-sf-base shadow-2xl" :class="sizeConvert(8)">
        {{ userInfo.name }}
      </div>
      <div class="flex-c h-20" :class="sizeConvert(6, 'gap')">
        <el-anchor direction="horizontal" class="h-14" :offset="0" @click="handleClick">
          <el-anchor-link :href="`#${item.href}`" v-for="item in navList" :key="item.href">
            <div class="nav-link flex-c h-14 font-bold text-sf-base" :class="sizeConvert(7)">
              {{ item.name }}
            </div>
          </el-anchor-link>
        </el-anchor>
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
