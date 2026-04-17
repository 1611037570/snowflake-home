<script setup>
import { ref } from 'vue'
import Score from './Score.vue'

// 底部输入框绑定的值
const inputValue = ref('')
</script>

<template>
  <div class="flex h-full w-full flex-col bg-amber-100 p-4">
    <!-- 上方：简历打分组件区，占据剩余空间并支持滚动 -->
    <div class="flex-1 overflow-y-auto">
      <Score />
    </div>

    <!-- 下方：输入框 -->
    <div class="mt-4 shrink-0">
      <el-input v-model="inputValue" placeholder="请输入..." clearable />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
