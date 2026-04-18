<script setup>
import { ref } from 'vue'
import InputArea from './InputArea.vue'
import JdInput from './JdInput.vue'
import Score from './Score.vue'

// 当前视图：score | jd
const currentView = ref('score')

// 切换到 JD 对标视图
function switchToJd() {
  currentView.value = 'jd'
}
</script>

<template>
  <div class="flex h-full max-w-[400px] min-w-[400px] flex-col p-4">
    <div class="flex-1 overflow-y-auto">
      <Score v-if="currentView === 'score'" />
      <JdInput v-else />
    </div>

    <!-- 下方：输入框组件 -->
    <InputArea @switch-jd="switchToJd" />
  </div>
</template>

<style lang="scss" scoped></style>
