<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
const DEFAULT_PROMPT = {
  role: 'system',
  content: `你是资深招聘HR，名字叫简答羊，你是资深招聘HR，擅长挖掘候选人过往经历中的隐性亮点并通过量化方式最大化呈现个人价值。
    说话简洁准确，不拖沓、不矫情。回答以这个设定为基础，如果遇到非简历相关问题，直接回答“我只能修改简历相关问题”。`,
}
console.log(DEFAULT_PROMPT)
// 底部输入框绑定的值
const inputValue = ref('')

const resumeStore = useResumeStore()
const { selectedModuleKeys } = storeToRefs(resumeStore)

const removeKey = (key) => {
  selectedModuleKeys.value.delete(key)
}
</script>

<template>
  <!-- AI 快捷操作按钮 -->
  <div class="flex gap-3">
    <button
      class="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-50/50 py-1 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98]"
    >
      <SfIcon
        icon="ph:magic-wand-duotone"
        :size="4"
        class="transition-transform group-hover:rotate-12"
      />
      AI 生成
    </button>
    <button
      class="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-50/50 py-1 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98]"
    >
      <SfIcon
        icon="ph:magic-wand-duotone"
        :size="4"
        class="transition-transform group-hover:rotate-12"
      />
      AI 润色
    </button>
    <button
      class="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-50/50 py-1 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98]"
    >
      <SfIcon
        icon="ph:stethoscope-duotone"
        :size="4"
        class="transition-transform group-hover:scale-110"
      />
      AI 诊断
    </button>
  </div>
  <div
    class="mt-3 flex shrink-0 flex-col gap-1 rounded-2xl border border-sf-border/50 bg-white p-3 shadow-sm"
  >
    <!-- 选中的模块 tags -->
    <div v-if="selectedModuleKeys.size > 0" class="mt-1 flex items-start gap-2 rounded-lg">
      <div class="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-gray-500">已选:</div>
      <div class="flex flex-wrap gap-1.5">
        <el-tag
          v-for="key in Array.from(selectedModuleKeys)"
          :key="key"
          closable
          @close="removeKey(key)"
          size="small"
          effect="plain"
          round
          class="!border-gray-200 !text-gray-600"
        >
          {{ key }}
        </el-tag>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="relative">
      <el-input v-model="inputValue" placeholder="告诉 AI 你的需求..." clearable class="w-full" />
      <!-- 发送按钮 -->
      <button
        class="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded bg-blue-500 text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!inputValue.trim()"
      >
        <SfIcon icon="ph:paper-plane-right-fill" :size="14" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
