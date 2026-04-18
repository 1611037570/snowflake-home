<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Index from './index.vue'

const isVisible = ref(false)
const route = useRoute()

// 判断当前路由是否包含 'resume' 或 'ai'，如果包含则不显示
const shouldShow = computed(() => {
  if (route.path === '/') return false
  const path = route.path.toLowerCase()
  return !path.includes('/resume') && !path.includes('/ai')
})

const toggleChat = () => {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div v-if="shouldShow" class="fixed right-8 bottom-8 z-9999 flex flex-col items-end gap-4">
    <!-- 聊天窗口：带展开动画 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-10 scale-95 opacity-0"
      enter-to-class="translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 scale-100 opacity-100"
      leave-to-class="translate-y-10 scale-95 opacity-0"
    >
      <div
        v-if="isVisible"
        class="h-[600px] w-[460px] overflow-hidden rounded-2xl border border-sf-border/50 bg-sf-bg shadow-2xl ring-1 ring-black/5"
      >
        <Index />
      </div>
    </Transition>

    <!-- 悬浮切换按钮 (雪花图标) -->
    <button
      class="group flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-linear-to-tr from-sf-theme via-sf-theme/90 to-sf-theme text-white shadow-lg transition-all duration-300 hover:rotate-12 hover:shadow-xl active:scale-90"
      @click="toggleChat"
    >
      <SfIcon
        :icon="isVisible ? 'ph:x-bold' : 'ph:snowflake-duotone'"
        :size="isVisible ? 6 : 8"
        class="transition-transform duration-300"
        :class="{ 'rotate-90': isVisible }"
      />

      <!-- 未读/状态提示点 (可选装饰) -->
      <div
        v-if="!isVisible"
        class="absolute top-0 right-0 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-red-500"
      ></div>
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
