<template>
  <div
    class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-sf-border/50 bg-sf-bg-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-theme/50 hover:shadow-xl"
    @click="handleClick"
  >
    <!-- 图片区域 -->
    <div class="relative h-48 w-full overflow-hidden bg-sf-bg">
      <SfImg
        v-if="data.img"
        :src="data.img"
        :alt="data.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <!-- 无图片时的占位 -->
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-sf-bg to-sf-bg-hover"
      >
        <div class="flex items-center justify-center rounded-full bg-sf-bg-2 p-3 shadow-inner">
          <SfIcon icon="mingcute:code-line" size="20" class="text-sf-text-3 opacity-50" />
        </div>
      </div>

      <!-- 遮罩层 -->
      <div
        class="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
      ></div>
    </div>

    <!-- 内容区域 -->
    <div class="flex flex-1 flex-col p-5">
      <div class="mb-3 flex items-center justify-between">
        <h3
          class="text-lg font-bold text-sf-text transition-colors duration-300 group-hover:text-sf-theme"
        >
          {{ data.name }}
        </h3>
        <SfIcon
          icon="mingcute:arrow-right-up-line"
          class="-translate-x-2 text-sf-text-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-sf-theme group-hover:opacity-100"
          size="20"
        />
      </div>

      <p class="line-clamp-2 text-sm leading-relaxed text-sf-text-2" v-if="data.desc">
        {{ data.desc }}
      </p>

      <!-- 底部标签或链接提示 -->
      <div
        class="mt-auto flex items-center justify-end pt-4 text-xs font-medium text-sf-theme opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span>{{ isExternal ? '访问网站' : '查看详情' }}</span>
        <SfIcon icon="mingcute:arrow-right-line" class="ml-1" size="14" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const isExternal = computed(() => {
  return (props.data.url && props.data.url.startsWith('http')) || props.data.urlType === 'web'
})

// routeNavigation
const handleClick = () => {
  // 优先使用全局 routerNavigation，如果存在
  if (typeof routerNavigation === 'function') {
    routerNavigation(props.data.url)
  } else {
    // 降级处理
    if (isExternal.value) {
      window.open(props.data.url, '_blank')
    } else {
      console.warn('routerNavigation is not defined')
    }
  }
}
</script>
