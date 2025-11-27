<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 backdrop-blur-md"
    @click="openAbout"
  >
    <ElImage
      :src="snowIcon"
      class="h-7.5 w-7.5 transition-all duration-200 hover:rotate-180"
      fit="contain"
    />
    <Modal v-if="aboutVisible" />
  </div>
</template>

<script setup>
import snowIcon from '@/assets/images/snow.svg'
import { useHomeStore } from '@/stores'
import Modal from '@/views/home/about/modal.vue'
const homeStore = useHomeStore()
const { aboutVisible } = storeToRefs(homeStore)

const openAbout = () => {
  aboutVisible.value = true
}
</script>

<style scoped>
/* 添加容器悬停效果 */
.sf-set-container {
  transition: all 0.2s ease;
}

/* 确保内容区域有良好的间距 */
.text-center {
  margin: 16px 0;
}
</style>
