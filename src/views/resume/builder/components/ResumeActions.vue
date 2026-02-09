<script setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

// 定义弹窗显示状态
const isModalVisible = ref(false)

// 测试拖拽数组
const testList = ref([
  { id: 1, name: '基本信息', icon: 'basil:file-user-solid' },
  { id: 2, name: '教育背景', icon: 'mdi:school' },
  { id: 3, name: '工作经历', icon: 'lucide:briefcase' },
  { id: 4, name: '项目经验', icon: 'lucide:code' },
  { id: 5, name: '专业技能', icon: 'mdi:hammer-wrench' },
])

// 处理按钮点击
const handleButtonClick = () => {
  isModalVisible.value = true
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
        <div class="mb-2 text-sf-base">拖拽模块进行排序：</div>

        <VueDraggable
          v-model="testList"
          class="flex flex-col gap-2"
          animation="150"
          ghostClass="opacity-50"
          handle=".drag-handle"
        >
          <div
            v-for="item in testList"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl border border-sf-border bg-sf-primary p-3 transition-all hover:border-sf-theme-hover"
          >
            <div class="drag-handle flex-c h-8 w-8 cursor-move rounded-lg hover:bg-sf-bg-hover">
              <SfIcon icon="mdi:drag-variant" size="5" class="text-sf-secondary" />
            </div>
            <SfIcon :icon="item.icon" size="5" class="text-sf-theme" />
            <span class="font-medium text-sf-base">{{ item.name }}</span>
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
