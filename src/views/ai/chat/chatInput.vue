<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'send', 'stop', 'update:thinkMode'])

const inputRef = ref(null)

// 思考模式配置
const thinkModes = [
  {
    key: 'fast',
    label: '快速模式',
    activeClass: 'bg-sf-bg-3 text-sf-text shadow-sm ring-1 ring-sf-border',
  },
  {
    key: 'deep',
    label: '深度思考',
    activeClass: 'bg-sf-theme text-white shadow-lg shadow-sf-theme',
  },
]

// 计算是否可以发送消息
const canSend = computed(() => !!props.modelValue.trim())

// 动态动作按钮配置
const actionButtonConfig = computed(() => {
  if (props.isGenerating) {
    return {
      icon: 'ph:stop-circle-fill',
      title: '停止生成',
      class:
        'bg-sf-error/10 text-sf-error shadow-sm hover:bg-sf-error hover:text-white active:scale-95',
      handler: () => emit('stop'),
      disabled: false,
    }
  }
  return {
    icon: 'ph:paper-plane-right-fill',
    title: '发送消息',
    class: canSend.value
      ? 'cursor-pointer bg-sf-theme text-white shadow-lg shadow-sf-theme/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sf-theme/35 active:translate-y-0 active:scale-95'
      : 'cursor-not-allowed bg-sf-bg-3 text-sf-text opacity-50',
    handler: () => emit('send'),
    disabled: !canSend.value,
  }
})

const handleInput = (val) => {
  emit('update:modelValue', val)
}

const handleKeydown = (e) => {
  // 仅支持 Enter 发送，Shift + Enter 换行
  const isSendKey = !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey

  if (isSendKey) {
    e.preventDefault()
    if (!props.isGenerating && canSend.value) {
      emit('send')
    }
  }
}

// 暴露 focus 方法给父组件调用
const focus = () => {
  inputRef.value?.focus()
}
defineExpose({ focus })

onMounted(() => {
  focus()
})
</script>

<template>
  <footer class="relative flex w-full flex-col items-center bg-sf-bg p-3">
    <div class="relative z-10 w-full max-w-4xl">
      <!-- 主输入容器：增强阴影与圆角细节 -->
      <div
        class="group hover:border-sf-border-hover relative flex flex-col rounded-[24px] border border-sf-border bg-sf-bg-2 p-1.5 shadow-sm transition-all duration-500 focus-within:border-sf-theme focus-within:shadow-xl focus-within:ring-4 focus-within:ring-sf-theme/10 hover:shadow-md"
      >
        <!-- 输入框区域 -->
        <el-input
          ref="inputRef"
          :model-value="modelValue"
          @update:model-value="handleInput"
          type="textarea"
          rows="1"
          :autosize="{ minRows: 1, maxRows: 5 }"
          :placeholder="'按 Enter 发送，Shift + Enter 换行...'"
          class="ai-input"
          resize="none"
          @keydown.enter="handleKeydown"
        />

        <!-- 底部工具栏 -->
        <div class="flex items-center justify-between px-2 pt-1 pb-1.5">
          <!-- 左侧：模式切换 -->
          <div class="flex items-center gap-1 rounded-xl bg-sf-bg p-1 ring-1 ring-sf-border/50">
            <button
              v-for="mode in thinkModes"
              :key="mode.key"
              class="relative rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-all duration-300"
              :class="
                settings.thinkMode === mode.key
                  ? mode.activeClass
                  : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
              "
              @click="emit('update:thinkMode', mode.key)"
            >
              {{ mode.label }}
            </button>
          </div>

          <!-- 右侧：动态动作按钮 (发送/停止) -->
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 ease-out"
            :class="actionButtonConfig.class"
            :title="actionButtonConfig.title"
            :disabled="actionButtonConfig.disabled"
            @click="actionButtonConfig.handler"
          >
            <SfIcon
              :icon="actionButtonConfig.icon"
              size="4.5"
              class="transition-all duration-500"
              :class="{
                'group-focus-within:scale-110 group-focus-within:rotate-12':
                  !isGenerating && canSend,
              }"
            />
          </button>
        </div>
      </div>

      <!-- 底部免责声明 -->
      <small
        class="mt-3 flex items-center justify-center gap-1.5 text-[11px] tracking-wider text-sf-text-3 opacity-60 transition-opacity hover:opacity-100"
      >
        <SfIcon icon="ph:info-duotone" size="3" />
        <span>ai生成仅供参考，请保持独立思考。</span>
      </small>
    </div>
  </footer>
</template>

<style scoped>
/* 覆盖 el-input textarea 默认样式，使其融入容器 */
:deep(.ai-input .el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-sf-text);
}
:deep(.ai-input .el-textarea__inner:focus) {
  box-shadow: none !important;
}
:deep(.ai-input .el-textarea__inner::placeholder) {
  color: var(--color-sf-text-3);
}
</style>
