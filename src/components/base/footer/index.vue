<template>
  <footer
    class="flex-c relative overflow-hidden bg-sf-primary px-3 py-1 text-xs text-sf-text backdrop-blur-sm"
  >
    <div class="flex w-[300px] flex-col" :class="gapClass">
      <div class="flex items-center">
        © 2019-2025
        <span @click="goMy" class="ml-2 cursor-pointer font-medium hover:text-sf-theme">
          XiaoYang</span
        >
      </div>
      <div class="flex">
        运行时长：
        {{ runTime }}天
      </div>
      <div>
        服务支持：
        <span @click="back" class="cursor-pointer font-medium hover:text-sf-theme">雪花起始页</span>
      </div>
    </div>

    <div class="flex flex-col" :class="gapClass">
      <div class="cursor-pointer font-medium hover:text-sf-theme">版权声明</div>
      <div @click="donationVisible = true" class="cursor-pointer font-medium hover:text-sf-theme">
        捐赠我
      </div>
      <div
        class="group text-sf flex cursor-pointer items-center gap-1 hover:text-sf-theme"
        @click="goRepo"
      >
        项目仓库
      </div>
    </div>
    <Donation v-model="donationVisible" v-if="donationVisible" />
    <Banner v-if="banner" />
  </footer>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores'
import Banner from './banner.vue'
import Donation from './donation.vue'
const props = defineProps({
  gap: {
    type: Number,
    default: 1,
  },
  banner: {
    type: Boolean,
    default: true,
  },
})
const gapClass = computed(() => {
  return `gap-${props.gap}`
})
const systemStore = useSystemStore()
const { runTime } = storeToRefs(systemStore)

const donationVisible = ref(false)

function back() {
  routerNavigation('home')
}
function goMy() {
  routerNavigation('/')
}
function goRepo() {
  urlNavigation('https://github.com/1611037570/snowflake-index')
}
</script>

<style lang="scss" scoped></style>
