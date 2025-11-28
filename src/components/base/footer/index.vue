<template>
  <footer
    class="flex-c flex-col bg-sf-transparent-2 px-3 py-1 text-xs text-sf-theme shadow-sm backdrop-blur-sm"
  >
    <div>© 2020-2025</div>
    <div class="flex-c">
      运行时间：
      <span
        class="cursor-pointer font-medium transition-colors duration-300 hover:text-sf-theme-hover"
      >
        {{ runTime }}天</span
      >
    </div>
    <div class="flex-c">
      版权所有：
      <span
        @click="goMy"
        class="cursor-pointer font-medium transition-colors duration-300 hover:text-sf-theme-hover"
      >
        XiaoYang</span
      >
    </div>
    <div class="flex-c">
      技术支持：
      <span
        @click="back"
        class="cursor-pointer font-medium transition-colors duration-300 hover:text-sf-theme-hover"
        >雪花起始页</span
      >
    </div>
  </footer>
</template>

<script setup>
import { useSystemStore } from '@/stores'
const systemStore = useSystemStore()
const { runTime } = storeToRefs(systemStore)
function back() {
  routerNavigation('home')
}
function goMy() {
  routerNavigation('/')
}
</script>

<style lang="scss" scoped></style>
