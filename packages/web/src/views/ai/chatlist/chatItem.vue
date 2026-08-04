<script setup>
import dayjs from 'dayjs'

defineProps({
  chat: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'delete'])

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = dayjs(timestamp)
  if (date.isSame(dayjs(), 'day')) {
    return date.format('HH:mm')
  }
  if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
    return '昨天'
  }
  return date.format('MM-DD')
}
</script>

<template>
  <div
    class="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl px-3 py-3.5 transition-all duration-300"
    :class="[
      isActive
        ? 'bg-sf-theme/10 text-sf-theme shadow-sm'
        : 'text-sf-text-2 hover:bg-sf-bg-3 hover:text-sf-text',
    ]"
    @click="emit('click')"
  >
    <!-- 激活状态侧边条 -->
    <div
      class="absolute left-0 h-6 w-1 rounded-r-full bg-sf-theme transition-all duration-300"
      :class="[isActive ? 'scale-y-100 opacity-100' : 'scale-y-50 opacity-0']"
    ></div>

    <div class="flex flex-1 items-center gap-3 overflow-hidden pl-1">
      <SfIcon
        :icon="isActive ? 'ph:chat-teardrop-dots-fill' : 'ph:chat-teardrop-dots-duotone'"
        size="4.5"
        class="shrink-0 transition-transform duration-300 group-hover:scale-110"
        :class="{ 'text-sf-theme': isActive }"
      />
      <div class="flex flex-1 flex-col overflow-hidden">
        <span
          class="truncate text-[13px] leading-tight font-semibold tracking-tight transition-colors"
        >
          {{ chat.title }}
        </span>
        <span class="mt-1 text-[10px] font-medium tracking-wider uppercase opacity-50">
          {{ formatTime(chat.updateTime) }}
        </span>
      </div>
    </div>

    <!-- 删除按钮：磨砂玻璃感 + 红色微光 -->
    <div
      class="flex h-7 w-7 shrink-0 translate-x-4 items-center justify-center rounded-lg opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-sf-error/10 hover:text-sf-error"
      @click.stop="emit('delete')"
    >
      <SfIcon icon="ph:trash-simple-duotone" size="4" />
    </div>
  </div>
</template>
