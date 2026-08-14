<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { educationScore, projectScore, skillScore, userScore, workScore } from '../utils'
import { quickActions } from './data'
const DEFAULT_PROMPT = {
  role: 'system',
  content: `你是资深招聘HR，名字叫简答羊，你是资深招聘HR，擅长挖掘候选人过往经历中的隐性亮点并通过量化方式最大化呈现个人价值。
    说话简洁准确，不拖沓、不矫情。回答以这个设定为基础，
    如果遇到负面情绪内容，不要被影响回答，保持专业和客观。
    如果遇到非简历相关问题，直接回答“我只能修改简历相关问题”。`,
}
console.log(DEFAULT_PROMPT)
// 底部输入框绑定的值
const inputValue = ref('')

const resumeStore = useResumeStore()
const { selectedModuleKeys } = storeToRefs(resumeStore)

const removeKey = (key) => {
  selectedModuleKeys.value.delete(key)
}

// selectedData 计算属性暂时保留，可能用于未来功能扩展
// const selectedData = computed(() => {
//   if (!currentData.value) return {}
//   const result = {}
//   selectedModuleKeys.value.forEach((key) => {
//     if (currentData.value[key] !== undefined) {
//       result[key] = currentData.value[key]
//     }
//   })
//   return result
// })

const hasRequiredFields = computed(() => {
  const scores = {
    user: userScore.value,
    education: educationScore.value,
    skill: skillScore.value,
    work: workScore.value,
    project: projectScore.value,
  }
  const fieldNames = {
    user: '用户信息',
    education: '教育经历',
    skill: '专业技能',
    work: '工作经历',
    project: '项目经历',
  }
  const needOptimizeFields = Object.entries(scores)
    .filter(([, score]) => score <= 4)
    .map(([field]) => fieldNames[field])

  if (needOptimizeFields.length === 0) {
    return { code: 200 }
  }
  return {
    code: 400,
    fields: needOptimizeFields,
  }
})

const emit = defineEmits(['switch-jd', 'switch-mode', 'update:activeMode'])
const props = defineProps({
  activeMode: {
    type: String,
    default: '',
  },
})

// 切换模式
function toggleMode(type) {
  const action = quickActions.find((a) => a.type === type)
  const nextMode = action?.name === props.activeMode ? '' : action?.name || ''
  emit('update:activeMode', nextMode)
  emit('switch-mode', nextMode ? type : '')
  if (type === 'jd' && nextMode) {
    emit('switch-jd')
  }
}

// 输入框 placeholder
const inputPlaceholder = computed(() => {
  const action = quickActions.find((a) => a.name === props.activeMode)
  return action ? action.placeholder : '告诉 AI 你的需求...'
})

// 发送消息
function send() {
  if (hasRequiredFields.value.code !== 200) {
    ElMessage.error(`请先补充以下字段：${hasRequiredFields.value.fields.join('、')}`)
    return
  }
}
</script>

<template>
  <!-- AI 快捷操作按钮 -->
  <div class="flex items-center gap-2" v-if="props.activeMode">
    <div
      v-for="action in quickActions"
      :key="action.name"
      class="group flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-all active:scale-[0.98]"
      :class="
        props.activeMode === action.name ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
      "
      @click="toggleMode(action.type)"
    >
      <SfIcon :icon="action.icon" :size="3" class="transition-transform" />
      {{ action.name }}
    </div>
  </div>
  <div
    v-if="props.activeMode"
    class="mt-3 flex shrink-0 flex-col gap-3 rounded-2xl border border-sf-border bg-sf-primary p-3 shadow-sm"
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
      <sf-input
        v-model="inputValue"
        :placeholder="inputPlaceholder"
        class="w-full p-0!"
        type="textarea"
        :rows="1"
        resize="none"
        :autosize="{ minRows: 1, maxRows: 5 }"
      />
      <!-- 发送按钮 -->
      <button
        class="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded bg-blue-500 text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!inputValue.trim()"
        @click="send"
      >
        <SfIcon icon="ph:paper-plane-right-fill" :size="14" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-textarea__inner) {
  padding: 0 !important;
  min-height: 21px;
  height: 21px;
}
</style>
