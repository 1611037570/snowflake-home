<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const resumeStore = useResumeStore()
const { currentConfig } = storeToRefs(resumeStore)
// 定义弹窗显示状态
const isModalVisible = ref(false)

// 用户配置（不参与排序和删除）
const userConfigs = computed(() => {
  return currentConfig.value.filter((item) => item.type === 'user')
})

// 其他配置（参与排序和删除）
const otherConfigs = computed({
  get: () => currentConfig.value.filter((item) => item.type !== 'user'),
  set: (val) => {
    // 保持 userConfigs 在最前面，合并排序后的 otherConfigs
    currentConfig.value = [...userConfigs.value, ...val]
    return currentConfig.value
  },
})

// 处理按钮点击
const handleButtonClick = () => {
  isModalVisible.value = true
}

// 处理删除模块
const handleDelete = (type) => {
  const index = currentConfig.value.findIndex((item) => item.type === type)
  if (index !== -1) {
    currentConfig.value.splice(index, 1)
  }
}
</script>

<template>
  <!-- 右上角固定按钮组 -->
  <div class="absolute top-6 right-6 z-50 flex flex-col gap-3">
    <div
      class="flex-c shadow-sf group h-12 w-12 cursor-pointer rounded-2xl border border-sf-border bg-sf-bg duration-300 hover:scale-110 hover:border-sf-theme"
      @click="handleButtonClick"
    >
      <SfIcon icon="ic:round-add" size="6" class="group-hover:text-sf-theme" />
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
            <span class="font-medium text-sf-base">{{ item.type }}</span>
          </div>
        </div>

        <VueDraggable
          v-model="otherConfigs"
          class="flex flex-col gap-2"
          animation="150"
          ghostClass="opacity-50"
          handle=".drag-handle"
        >
          <div
            v-for="item in otherConfigs"
            :key="item.type"
            class="flex items-center gap-3 rounded-xl border border-sf-border bg-sf-primary p-3 transition-all hover:border-sf-theme-hover"
          >
            <div class="drag-handle flex-c h-8 w-8 cursor-move rounded-lg hover:bg-sf-bg-hover">
              <SfIcon icon="mdi:drag-variant" size="5" class="text-sf-secondary" />
            </div>
            <SfIcon :icon="item.icon" size="5" class="text-sf-theme" />
            <span class="font-medium text-sf-base">{{ item.type }}</span>

            <!-- 删除按钮 -->
            <div
              class="flex-c text-sf-secondary hover:bg-sf-danger/10 hover:text-sf-danger ml-auto h-8 w-8 cursor-pointer rounded-lg transition-colors"
              @click.stop="handleDelete(item.type)"
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

<style scoped>
.shadow-sf {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
</style>
