<template>
  <div class="flex-c min-h-screen flex-col bg-sf-primary">
    <div class="text-lg font-medium text-sf-text">加载失败，请稍后重试</div>
    <div class="mt-2 text-sf-text">{{ count }}s 后自动跳转</div>
    <button class="sf-theme-element mt-4 rounded px-4 py-2" @click="jump">立即跳转</button>
  </div>
</template>

<script setup>
import { defaultNavigation } from '@/utils'
import { useIntervalFn } from '@vueuse/core'
const count = ref(3)
function jump() {
  defaultNavigation()
}
const { pause, resume } = useIntervalFn(() => {
  count.value -= 1
  if (count.value <= 0) {
    pause()
    jump()
  }
}, 1000)

onMounted(() => {
  resume()
})
</script>

<style scoped></style>
