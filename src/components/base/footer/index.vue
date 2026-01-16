<template>
  <footer
    class="flex-c relative flex-col overflow-hidden bg-sf-primary px-3 py-1 text-sf-text backdrop-blur-sm"
    :class="gapClass"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center">
        Copyright © 2019-2025 .
        <span @click="userNavigation" class="ml-2 cursor-pointer font-medium hover:text-sf-theme">
          小羊</span
        >
        <span class="px-1">.</span>
        All Rights Reserved.
      </div>
      <div @click="aboutVisible = true" class="cursor-pointer font-medium hover:text-sf-theme">
        关于网站
      </div>
      <div class="cursor-pointer font-medium hover:text-sf-theme">版权声明</div>
    </div>
    <div class="flex min-w-[200px] items-center" :class="gapClass">
      <div>
        服务支持：
        <span @click="defaultNavigation" class="cursor-pointer font-medium hover:text-sf-theme"
          >雪花起始页</span
        >
      </div>
      <div @click="donationVisible = true" class="cursor-pointer font-medium hover:text-sf-theme">
        赞助支持
      </div>
    </div>

    <div class="flex flex-col" :class="gapClass">
      <!-- <div class="group flex cursor-pointer items-center hover:text-sf-theme" @click="goRepo">
        项目仓库
      </div> -->
    </div>
    <Donation v-model="donationVisible" v-if="donationVisible" />
    <Banner v-if="banner" />
    <About v-if="aboutVisible" v-model="aboutVisible" />
  </footer>
</template>

<script setup lang="ts">
import { defaultNavigation, userNavigation } from '@/utils'
import About from './about.vue'
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

const donationVisible = ref(false)
const aboutVisible = ref(false)

// function goRepo() {
//   urlNavigation('https://github.com/1611037570/snowflake-index')
// }
</script>

<style lang="scss" scoped></style>
