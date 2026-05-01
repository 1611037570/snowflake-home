<script setup>
import { ALL_PAGE } from '@/constants'
import More from './more.vue'

const route = useRoute()

// 从items数组中获取当前路由的标题
const title = computed(() => {
  const currentItem = ALL_PAGE.value.find((item) => item.url === route.path)
  return currentItem?.name || ''
})

// 获取当前路由的版本号
const version = computed(() => {
  const currentItem = ALL_PAGE.value.find((item) => item.url === route.path)
  return currentItem?.version || ''
})
</script>

<template>
  <header
    class="relative flex h-12 items-center justify-start border-b-[0.5px] border-sf-border bg-sf-primary p-3 text-sf-base sm:h-14 md:justify-center"
  >
    <div
      class="flex-c top-1/2 left-3 mr-3 cursor-pointer text-xs md:absolute md:-translate-y-1/2 md:text-base"
      @click="back"
    >
      <SfBackHome />
    </div>
    <div
      class="absolute top-1/2 left-10 flex -translate-y-1/2 items-center gap-1 transition-all duration-300 md:left-1/2 md:-translate-x-1/2 md:gap-2"
    >
      <div class="text-xm font-bold md:text-2xl">{{ title }}</div>
      <div
        v-if="version"
        class="rounded-full bg-sf-theme/10 px-2 py-1 text-xs font-medium text-sf-theme"
      >
        v{{ version }}
      </div>
    </div>
    <div class="flex-c absolute top-1/2 right-3 -translate-y-1/2 gap-1 md:gap-3">
      <slot name="right"></slot>
      <SfTheme />
      <SfLocale />
      <More />
    </div>
  </header>
</template>

<style lang="scss" scoped></style>
