<script setup>
import InputArea from './InputArea.vue'
import Score from './Score.vue'
</script>

<template>
  <div class="flex h-full w-[400px] flex-col bg-amber-100 p-4">
    <!-- 上方：简历打分组件区，占据剩余空间并支持滚动 -->
    <div class="flex-1 overflow-y-auto">
      <Score />
    </div>

    <!-- 下方：输入框组件 -->
    <InputArea />
  </div>
</template>

<style lang="scss" scoped></style>
