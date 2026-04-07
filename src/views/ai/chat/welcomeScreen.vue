<script setup>
import { userInfo } from '@/views/index/data'
import { computed } from 'vue'

const emit = defineEmits(['suggest'])

const suggestCards = computed(() => {
  console.log(userInfo.value)
  const list = [
    {
      icon: 'ph:user-circle-duotone',
      title: '作者简介',
      desc: '了解关于作者 ' + userInfo.value.name + ' 的开发与摄影生活',
      prompt: `请详细介绍一下本站作者${userInfo.value.name}。基本信息如下：姓名：${userInfo.value.name}；坐标：${userInfo.value.location}；职业：${userInfo.value.job}；开发起航：${userInfo.value.devYears}；摄影记录：${userInfo.value.shootYears}。`,
    },
    {
      icon: 'ph:lightbulb-duotone',
      title: '创意策划',
      desc: '为一个科技产品发布会构思五个创意主题',
      prompt: '请为一个全新的 AI 科技产品发布会构思 5 个创意主题，并简要说明理由。',
    },
  ]
  return list
})
</script>

<template>
  <div
    class="animate-fade-in-up flex h-full min-h-full w-full min-w-full flex-col items-center justify-center gap-8 px-4"
  >
    <!-- 欢迎页头部：简化结构 -->
    <div class="flex flex-col items-center gap-4 text-center">
      <div class="space-y-1">
        <h1 class="text-xl font-black tracking-tight text-sf-text">
          你好！我是 <span class="text-sf-theme">小雪</span>
        </h1>
        <p class="text-sm font-medium text-sf-text-3 opacity-80">
          我可以帮你写代码、解答问题、或者进行创意写作。
        </p>
      </div>
    </div>

    <!-- 建议卡片：限制宽度并简化结构 -->
    <div class="grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-2">
      <button
        v-for="card in suggestCards"
        :key="card.title"
        class="group flex cursor-pointer items-start gap-3 rounded-xl border border-sf-border bg-sf-bg-2 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sf-theme hover:shadow-md active:scale-[0.98]"
        @click="emit('suggest', card.prompt)"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sf-bg text-sf-text-3 transition-colors duration-300 group-hover:bg-sf-theme/10 group-hover:text-sf-theme"
        >
          <SfIcon :icon="card.icon" size="4.5" />
        </div>
        <div class="flex flex-col gap-0.5 overflow-hidden">
          <h3 class="text-sm font-bold tracking-tight text-sf-text">
            {{ card.title }}
          </h3>
          <p class="truncate text-[12px] text-sf-text-3 opacity-70">
            {{ card.desc }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
</style>
