<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'
const getCurrentGreeting = () => {
  const now = new Date()
  const hour = now.getHours()

  if (hour >= 6 && hour < 12) {
    return '早上好'
  } else if (hour >= 12 && hour < 14) {
    return '中午好'
  } else if (hour >= 14 && hour < 18) {
    return '下午好'
  } else if (hour >= 18 && hour < 22) {
    return '晚上好'
  } else {
    return '凌晨好'
  }
}

const greeting = getCurrentGreeting()
onMounted(() => {
  ElNotification({
    title: greeting,
    position: 'top-left',
    zIndex: 9999,
    duration: 2000,
    showClose: false,
  })
})
</script>

<style>
.el-notification {
  width: auto !important;
}
</style>
