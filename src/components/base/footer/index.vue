<template>
  <footer
    class="flex-c bg-sf-transparent-2 px-3 py-1 text-xs text-sf-theme shadow-sm backdrop-blur-sm"
  >
    <div class="flex w-[300px] flex-col">
      <div class="flex">
        © 2020-2025 版权所有：
        <span
          @click="goMy"
          class="cursor-pointer font-medium transition-colors duration-300 hover:text-sf-theme-hover"
        >
          XiaoYang</span
        >
      </div>
      <div class="flex">
        运行时长：
        <span class="cursor-pointer font-medium transition-colors"> {{ runTime }}天</span>
      </div>
    </div>

    <div class="flex flex-col">
      <div>
        技术支持：
        <span
          @click="back"
          class="cursor-pointer font-medium transition-colors duration-300 hover:text-sf-theme-hover"
          >雪花起始页</span
        >
      </div>
      <div
        class="group flex cursor-pointer items-center gap-1 text-sf-theme transition-colors duration-300 hover:text-sf-theme-hover"
        @click="goRepo"
      >
        <SfIcon icon="mdi:github" size="4" />
        <span>项目源码</span>
        <SfIcon
          icon="tabler:external-link"
          size="4"
          class="opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
      <div>捐赠我</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores'
const systemStore = useSystemStore()
const { runTime } = storeToRefs(systemStore)
function back() {
  routerNavigation('home')
}
function goMy() {
  routerNavigation('/')
}
function goRepo() {
  urlNavigation('https://github.com/1611037570')
}
</script>

<style lang="scss" scoped></style>
