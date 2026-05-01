<script setup>
import { useResumeStore } from '@/stores'
import eventBus from '@/utils/modules/eventBus'
import { storeToRefs } from 'pinia'
import Title from './title.vue'

const resumeStore = useResumeStore()
const { isPrinting, layout } = storeToRefs(resumeStore)

const handleDownload = () => {
  if (isPrinting.value) return
  eventBus.emit('resume-print-pdf')
}

const layoutList = [
  {
    name: '列表布局',
    value: 'list',
    icon: 'fluent:align-left-24-filled',
  },
  {
    name: '三栏布局',
    value: 'three',
    icon: 'lucide:layout-panel-left',
  },
  {
    name: 'AI布局',
    value: 'ai',
    icon: 'tabler:switch-3',
  },
]
const handleLayoutClick = (item) => {
  resumeStore.setLayout(item.value)
}
</script>

<template>
  <header
    class="flex h-12 items-center justify-between border-b border-sf-border bg-sf-primary px-6 shadow-sm"
  >
    <!-- 左侧占位 -->
    <div class="flex flex-1 items-center gap-6">
      <SfBack />
      <div
        class="flex items-center gap-1.5 rounded-full bg-sf-theme/10 px-3 py-1 text-sf-theme transition-all hover:bg-sf-theme/20"
      >
        <SfIcon icon="lucide:sparkles" size="3.5" class="animate-pulse" />
        <span class="text-sm font-bold tracking-wide">AI 简历</span>
      </div>
      <Title />
    </div>

    <!-- 右侧工具栏 -->
    <div class="flex items-center gap-6">
      <!-- 快捷图标 -->
      <div class="flex items-center gap-5 text-sf-text-2">
        <SfIcon
          icon="tabler:history"
          size="5"
          class="cursor-pointer transition-colors hover:text-sf-theme"
          title="历史记录"
        />
        <SfLocale />
        <SfTheme />
      </div>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-sf-border"></div>

      <!-- 布局切换器 -->
      <div class="flex items-center gap-1 rounded-lg bg-sf-bg-hover p-1">
        <SfTooltip v-for="item in layoutList" :key="item.value" :content="item.name">
          <button
            type="button"
            class="flex-c h-8 w-8 rounded-md text-sf-text-2 transition-all hover:bg-sf-primary hover:text-sf-theme"
            :class="{ 'bg-sf-primary text-sf-theme shadow-sm': layout === item.value }"
            @click="handleLayoutClick(item)"
          >
            <SfIcon :icon="item.icon" size="4.5" />
          </button>
        </SfTooltip>
      </div>
      <!-- 操作按钮组 -->
      <div class="flex items-center gap-2.5">
        <el-button
          @click="handleDownload"
          :loading="isPrinting"
          class="!h-9 !rounded-lg !border-sf-border !bg-sf-primary !px-4 !font-medium !text-sf-text-2 hover:!border-sf-theme hover:!text-sf-theme"
        >
          <template #icon v-if="!isPrinting">
            <SfIcon icon="material-symbols:download" size="4.5" class="mr-1" />
          </template>
          {{ isPrinting ? '生成中...' : '下载' }}
        </el-button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
