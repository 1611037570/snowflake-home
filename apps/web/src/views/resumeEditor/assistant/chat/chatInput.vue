<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { thinkMode } = storeToRefs(aiStore);

// 是否正在发送中，由父组件（index.vue）控制
const props = defineProps({
  isSending: {
    type: Boolean,
    default: false,
  },
});

// 发送 / 停止事件
const emit = defineEmits(["send", "stop"]);

// 输入框绑定的值
const modelValue = ref("");
const inputRef = ref(null);

// 思考模式配置
const thinkModes = [
  {
    name: "快速模式",
    value: false,
  },
  {
    name: "深度思考",
    value: true,
  },
];

// 计算是否可以发送消息
const canSend = computed(() => !!modelValue.value.trim() && !props.isSending);

// 动态动作按钮配置
const actionButtonConfig = computed(() => {
  if (props.isSending) {
    return {
      icon: "ph:stop-circle-fill",
      title: "停止生成",
      class:
        "bg-sf-error/10 text-sf-error shadow-sm hover:bg-sf-error hover:text-white active:scale-95",
      handler: () => emit("stop"),
      disabled: false,
    };
  }
  return {
    icon: "ph:paper-plane-right-fill",
    title: "发送消息",
    class: canSend.value
      ? "cursor-pointer bg-sf-theme text-white shadow-lg shadow-sf-theme/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sf-theme/35 active:translate-y-0 active:scale-95"
      : "cursor-not-allowed bg-sf-bg-3 text-sf-text opacity-50",
    handler: () => handleSend(),
    disabled: !canSend.value,
  };
});

/**
 * 处理发送消息：清空输入框并通知父组件发送
 */
const handleSend = () => {
  const content = modelValue.value.trim();
  // 确保输入内容不为空，且当前没有正在发送的消息
  if (!content || props.isSending) return;
  // 清空输入框并聚焦，发送逻辑交由父组件处理
  modelValue.value = "";
  nextTick(() => inputRef.value?.focus());
  emit("send", content);
};

const handleKeydown = (e) => {
  // 仅支持 Enter 发送，Shift + Enter 换行
  const isSendKey = !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey;

  if (isSendKey) {
    e.preventDefault();
    if (canSend.value) {
      handleSend();
    }
  }
};

// 暴露 focus 方法给父组件调用
const focus = () => {
  inputRef.value?.focus();
};
// 暴露 setValue 方法，供父组件撤回消息时回填内容
const setValue = (val) => {
  modelValue.value = val;
};
defineExpose({ focus, setValue });

onMounted(() => {
  focus();
});
</script>

<template>
  <footer class="relative flex w-full flex-col items-center p-3">
    <div class="relative z-10 w-full max-w-4xl">
      <!-- 主输入容器：增强阴影与圆角细节 -->
      <div
        class="group hover:border-sf-b-hover border-sf-b relative flex flex-col rounded-2xl border bg-sf-bg p-1 shadow-sm transition-all duration-500"
      >
        <!-- 输入框区域 -->
        <el-input
          ref="inputRef"
          v-model="modelValue"
          type="textarea"
          rows="1"
          :autosize="{ minRows: 1, maxRows: 5 }"
          placeholder="按 Enter 发送，Shift + Enter 换行..."
          class="ai-input"
          resize="none"
          @keydown.enter="handleKeydown"
        />

        <!-- 底部工具栏 -->
        <div class="flex items-center justify-between px-1 pb-1">
          <!-- 左侧：模式切换 -->
          <div class="flex items-center rounded-xl bg-sf-primary p-1">
            <button
              v-for="mode in thinkModes"
              :key="mode.value"
              class="relative cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300"
              :class="
                thinkMode == mode.value
                  ? 'bg-sf-theme text-white'
                  : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
              "
              @click="thinkMode = !thinkMode"
            >
              {{ mode.name }}
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
                'group-focus-within:scale-110 ': canSend,
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
:deep(.ai-input .el-textarea__inner::placeholder) {
  color: var(--color-sf-text-3);
}
</style>
