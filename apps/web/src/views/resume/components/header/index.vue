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
    icon: 'fluent:layout-column-one-third-left-24-regular',
  },
  {
    name: '三栏布局',
    value: 'three',
    icon: 'fluent:layout-column-three-24-regular',
  },
  {
    name: 'AI布局',
    value: 'ai',
    icon: 'fluent:layout-column-one-third-right-24-regular',
  },
]
const handleLayoutClick = (item) => {
  resumeStore.setLayout(item.value)
}
</script>

<template>
  <header
    class="flex h-12 items-center justify-between border-b border-sf-border bg-sf-primary px-6"
  >
    <!-- 左侧占位 -->
    <div class="flex flex-1 items-center gap-4">
      <SfBack url="/resumeMain" tip="简历首页" />
      <div
        class="flex items-center gap-1.5 rounded-full px-3 py-1 text-sf-theme transition-all hover:bg-sf-theme/20"
      >
        <SfLogo size="5.5" class="animate-pulse" name="resumeMain" />
        <span class="text-sm font-bold tracking-wide">小羊简历</span>
      </div>
      <Title />
    </div>

    <!-- 右侧工具栏 -->
    <div class="flex items-center gap-6">
      <!-- 布局切换器 -->
      <div class="flex items-center gap-1 rounded-xl bg-sf-bg-hover p-1">
        <SfTooltip v-for="item in layoutList" :key="item.value" :content="item.name">
          <button
            type="button"
            class="flex-c h-7 w-7 rounded-lg text-sf-text-2 transition-all hover:bg-sf-primary hover:text-sf-theme"
            :class="{ 'bg-sf-primary text-sf-theme shadow-sm': layout === item.value }"
            @click="handleLayoutClick(item)"
          >
            <SfIcon :icon="item.icon" size="5.5" />
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

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-sf-border"></div>
      <!-- 快捷图标 -->
      <div class="flex items-center gap-5 text-sf-text-2">
        <SfDonation />
        <SfLocale />
        <SfTheme />
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
