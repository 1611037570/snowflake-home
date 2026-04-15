<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const resumeStore = useResumeStore()
const { currentConfig, currentFixedConfig } = storeToRefs(resumeStore)
// 定义弹窗显示状态
const isModalVisible = ref(false)

// 用户配置（不参与排序和删除）
const userConfigs = computed(() => {
  return currentFixedConfig.value.fields
})

// 其他配置（参与排序和删除）
const otherConfigs = computed(() => {
  return currentConfig.value
})

// 处理按钮点击
const handleButtonClick = () => {
  isModalVisible.value = true
}

// 处理删除模块
const handleDelete = (key) => {
  const index = currentConfig.value.findIndex((item) => item.key === key)
  if (index !== -1) {
    currentConfig.value.splice(index, 1)
  }
}
</script>

<template>
  <!-- 右上角固定按钮组 -->
  <div class="absolute top-15 right-0 z-50 flex flex-col">
    <div
      class="flex-c group cursor-pointer border border-sf-border bg-sf-bg p-1 text-sm hover:border-sf-theme"
      @click="handleButtonClick"
    >
      <SfIcon icon="ic:round-add" size="4" class="group-hover:text-sf-theme" />
      模块管理
    </div>

    <!-- 使用 SfModal 组件 -->
    <SfModal v-model="isModalVisible" title="模块排序">
      <div class="flex min-w-[400px] flex-col gap-4 p-4">
        <!-- 用户配置展示区（固定） -->
        <div class="flex flex-col gap-2">
          <div
            v-for="item in userConfigs"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl border border-sf-border bg-sf-bg-hover p-3 opacity-80"
          >
            <SfIcon :icon="item.icon || 'basil:file-user-solid'" size="5" class="text-sf-theme" />
            <span class="font-medium text-sf-base">{{ item.name }}</span>
          </div>
        </div>

        <VueDraggable
          v-if="otherConfigs.length > 0"
          v-model="otherConfigs"
          class="flex flex-col gap-2"
          animation="150"
          ghostClass="opacity-50"
          handle=".drag-handle"
        >
          <div
            v-for="item in otherConfigs"
            :key="item.key"
            class="flex items-center gap-3 rounded-xl border border-sf-border bg-sf-primary p-3 transition-all hover:border-sf-theme-hover"
          >
            <div class="drag-handle flex-c h-8 w-8 cursor-move rounded-lg hover:bg-sf-bg-hover">
              <SfIcon icon="mdi:drag-variant" size="5" class="text-sf-secondary" />
            </div>
            <SfIcon :icon="item.icon" size="5" class="text-sf-theme" />
            <span class="font-medium text-sf-base">{{ item.name }}</span>
            <!-- 删除按钮 -->
            <div
              class="flex-c text-sf-secondary hover:bg-sf-danger/10 hover:text-sf-danger ml-auto h-8 w-8 cursor-pointer rounded-lg transition-colors"
              @click.stop="handleDelete(item.key)"
            >
              <SfIcon icon="lucide:trash-2" size="4" />
            </div>
          </div>
        </VueDraggable>

        <div class="mt-4 flex justify-end gap-2">
          <el-button @click="isModalVisible = false">取消</el-button>
          <el-button type="primary" @click="isModalVisible = false">保存排序</el-button>
        </div>
      </div>
    </SfModal>
  </div>
</template>

<style scoped></style>
