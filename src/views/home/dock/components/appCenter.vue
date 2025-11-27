<template>
  <div>
    <div
      class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
      @click="visible = true"
    >
      添加
    </div>
    <AppCenter v-model="visible" />
  </div>
</template>

<script setup>
import AppCenter from '@/views/home/appCenter/index.vue'

const visible = ref(false)
</script>

<style scoped></style>
