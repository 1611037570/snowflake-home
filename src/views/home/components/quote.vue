<template>
  <div
    class="group group fixed bottom-48 left-1/2 z-90 -translate-x-1/2 transform cursor-pointer rounded-xl border border-gray-100 p-4 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md"
  >
    <!-- 按钮区域 - 顶部居中，鼠标经过时显示 -->
    <div
      class="absolute top-2 left-1/2 flex -translate-x-1/2 -translate-y-2 transform gap-2 whitespace-nowrap opacity-0 transition-all duration-300 group-hover:-translate-y-6 group-hover:opacity-100"
    >
      <div
        @click.stop="updateQuote"
        class="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600 shadow-md hover:bg-blue-200"
      >
        <sf-icon icon="lucide:refresh-cw" class="h-4 w-4" />
        刷新
      </div>
      <div
        class="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-600 shadow-md hover:bg-amber-200"
        @click.stop="toggleFavorite"
      >
        <sf-icon
          :icon="isFavorite ? 'lucide:heart' : 'lucide:heart'"
          class="h-4 w-4"
          :class="isFavorite ? 'fill-red-500 text-red-500' : ''"
        />
        收藏
      </div>
    </div>
    <p
      class="relative z-10 py-2 text-center text-sm leading-relaxed italic group-hover:text-blue-600"
      @click="copyQuote"
    >
      {{ quote }}
    </p>
  </div>
</template>

<script setup>
import { useClipboard } from '@/hooks'
import { getRandomQuote } from '@/utils'
import { onMounted, ref } from 'vue'

// 引言内容
const quote = ref('愿这份简历 能把你带到想去的地方！')
// 收藏状态
const isFavorite = ref(false)

// 使用剪贴板钩子
const { copyToClipboard } = useClipboard()

// 复制引言到剪贴板
const copyQuote = () => {
  copyToClipboard(quote.value)
}

// 更新引言的方法
const updateQuote = () => {
  quote.value = getRandomQuote()
  // 切换引言时取消收藏状态
  isFavorite.value = false
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

onMounted(() => {
  // updateQuote()
})
</script>

<style scoped></style>
